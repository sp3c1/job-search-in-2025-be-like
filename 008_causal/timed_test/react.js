export class InputCell {
  constructor(value) {
   this.value = value;
   this.subscribers = [];
  }

  setValue(value) {
    this.value = value;
    // propagate change
    this.notify();
  }

  // add subscribes  interested in the input cell
  subscribe(cell){
    this.subscribers.push(cell);
  }

  // send info that input cell has changed
  notify(){
      return this.subscribers.forEach(cell=>cell.notify(this));
  }

}

// note: this is the part i did not manage to get in time up
function subscribeNested(selfRef, inputCells = []){
  inputCells.forEach(cell=> {
    if(cell.subscribe) { // input cells subscribe
      cell.subscribe(selfRef)
    } else if(cell.inputCells){
      subscribeNested(selfRef, cell?.inputCells)
    }
  })
}

export class ComputeCell {
  constructor(inputCells=[], fn) {
    this.inputCells = inputCells; // array:  missing ts defs here ;_; 
    this.fn = fn;
    this.callbacks = [];
    // pre compute value
    this._val = this.fn(this.inputCells);

    // connect subscribers
    // note: this is the part i did not manage to get in time up
    // had to spent few minutes with debugger
    subscribeNested(this, this.inputCells);
  }

  // compute the value on demand
  get value() {
    return this.fn(this.inputCells)
  }

  // register callback
  addCallback(cb) {
   this.callbacks.push(cb);
  }

  // remove callback
  removeCallback(cb) {
    this.callbacks = this.callbacks.filter(callback => callback !== cb);
  }

  // propagate changes
  notify() {
    let val = this.fn(this.inputCells);
    
    if( this._val != val){
        this.callbacks.forEach(callback => callback.handleUpdate(this));
    }
    this._val = val;  
  }
  
}

export class CallbackCell {
  constructor(fn) {
    this.fn = fn
    this.values = [];
  }

  // execute on callback
  handleUpdate(cell) {
    const newValue = this.fn(cell);
    this.values.push(newValue);   
  }

}
