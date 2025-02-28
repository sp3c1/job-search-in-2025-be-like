package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sort"

	"github.com/Masterminds/semver/v3"
	"github.com/gorilla/mux"
)

func New() http.Handler {
	router := mux.NewRouter()
	router.Handle("/package/{package}/{version}", http.HandlerFunc(packageHandler))
	return router
}

type npmPackageMetaResponse struct {
	Versions map[string]npmPackageResponse `json:"versions"`
}

type npmPackageResponse struct {
	Name         string            `json:"name"`
	Version      string            `json:"version"`
	Dependencies map[string]string `json:"dependencies"`
}

type NpmPackageVersion struct {
	Name         string                        `json:"name"`
	Version      string                        `json:"version"`
	Dependencies map[string]*NpmPackageVersion `json:"dependencies"`
}

// idea: inject some DI - logger/memstore
func packageHandler(w http.ResponseWriter, r *http.Request) {
	// review/idea: add defer for recover
	vars := mux.Vars(r)
	pkgName := vars["package"]
	pkgVersion := vars["version"]

	// review / idea: detect circular structs
	rootPkg := &NpmPackageVersion{Name: pkgName, Dependencies: map[string]*NpmPackageVersion{}}
	// review: as mentioned later use waitgroup or channel, but then handle ctx: ctx := r.Context()
	if err := resolveDependencies(rootPkg, pkgVersion); err != nil {
		// review: use logger
		println(err.Error())
		w.WriteHeader(500)
		return
	}

	stringified, err := json.MarshalIndent(rootPkg, "", "  ")
	if err != nil {
		println(err.Error())
		w.WriteHeader(500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)

	// Ignoring ResponseWriter errors
	_, _ = w.Write(stringified)
}

func resolveDependencies(pkg *NpmPackageVersion, versionConstraint string) error {
	// review/idea: quering for almost the same information twice, npmPackageMetaResponse should have the data already
	// idea: add memeory store: check prior to call
	pkgMeta, err := fetchPackageMeta(pkg.Name)
	if err != nil {
		return err
	}

	concreteVersion, err := highestCompatibleVersion(versionConstraint, pkgMeta)
	if err != nil {
		// review: instead of error, mark in pkg?
		return err
	}
	pkg.Version = concreteVersion

	// review: this seems reduntant as mention aboe
	npmPkg, err := fetchPackage(pkg.Name, pkg.Version)
	if err != nil {
		return err
	}

	// review: use "go" command and wait groups to process requests in parallel
	// if given ptr to group can make it only for top level tree - or can allow for full nesting
	// review: use pkgMeta.Versions[pkg.Version].Dependencies after checking if exsists
	// also with NpmPackageVersion.Dependencies possibilit of panics for nil entries
	for dependencyName, dependencyVersionConstraint := range npmPkg.Dependencies {
		dep := &NpmPackageVersion{Name: dependencyName, Dependencies: map[string]*NpmPackageVersion{}}
		pkg.Dependencies[dependencyName] = dep
		if err := resolveDependencies(dep, dependencyVersionConstraint); err != nil {
			// review: should error in one dep stop whole process?
			return err
		}
	}
	return nil
}

func highestCompatibleVersion(constraintStr string, versions *npmPackageMetaResponse) (string, error) {
	constraint, err := semver.NewConstraint(constraintStr)
	if err != nil {
		return "", err
	}
	filtered := filterCompatibleVersions(constraint, versions)
	sort.Sort(filtered)
	// review: run before sort
	if len(filtered) == 0 {
		return "", errors.New("no compatible versions found")
	}
	return filtered[len(filtered)-1].String(), nil
}

func filterCompatibleVersions(constraint *semver.Constraints, pkgMeta *npmPackageMetaResponse) semver.Collection {
	var compatible semver.Collection
	for version := range pkgMeta.Versions {
		semVer, err := semver.NewVersion(version)
		if err != nil {
			// idea: log this situation to resolve err
			continue
		}
		if constraint.Check(semVer) {
			compatible = append(compatible, semVer)
		}
	}
	return compatible
}

func fetchPackage(name, version string) (*npmPackageResponse, error) {
	resp, err := http.Get(fmt.Sprintf("https://registry.npmjs.org/%s/%s", name, version))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// review: use error handling consistently or document why it is changed
	var parsed npmPackageResponse
	_ = json.Unmarshal(body, &parsed)
	return &parsed, nil
}

func fetchPackageMeta(p string) (*npmPackageMetaResponse, error) {
	resp, err := http.Get(fmt.Sprintf("https://registry.npmjs.org/%s", p))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var parsed npmPackageMetaResponse
	if err := json.Unmarshal([]byte(body), &parsed); err != nil {
		return nil, err
	}

	return &parsed, nil
}
