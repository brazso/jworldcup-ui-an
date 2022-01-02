export function isObjectEmpty(obj: any): boolean {
    return Object.keys(obj).length == 0;
}

export function isArrayEmpty<T>(array: Array<T>) {
    return !array.length;
}

export function distinctArrayByPropertyName<T>(array: Array<T>, propertyName: string) {
    const key = propertyName;
    const arrayUniqueByKey = [...new Map(array.map(item => [(item as any)[key], item])).values()];
    return arrayUniqueByKey;
}
