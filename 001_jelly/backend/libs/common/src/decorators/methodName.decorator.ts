export function MethodName(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    // The method name is available as propertyKey
    // You can modify the original method call to include the method name
    return originalMethod.apply(this, [...args, propertyKey]);
  };
}
