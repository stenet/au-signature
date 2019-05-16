import { Signature } from "./elements/signature/signature";
export class App {
  signature: Signature;
  
  onReset() {
    this.signature.clear();
  }
}
