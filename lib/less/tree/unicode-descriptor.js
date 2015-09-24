import Node from "./node";

export default function UnicodeDescriptor(value) {
    this.value = value;
};
UnicodeDescriptor.prototype = new Node();
UnicodeDescriptor.prototype.type = "UnicodeDescriptor";

