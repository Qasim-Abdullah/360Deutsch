export class ARButton {
  static createButton(renderer: any) {
    const button = document.createElement("button");

    button.style.position = "absolute";
    button.style.bottom = "20px";
    button.style.left = "50%";
    button.style.transform = "translateX(-50%)";
    button.style.padding = "12px 18px";
    button.style.fontSize = "16px";

    button.textContent = "Enter AR";

    button.onclick = async () => {
      if (!navigator.xr) {
        alert("WebXR not supported");
        return;
      }

      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: []
      });

      renderer.xr.setSession(session);
    };

    return button;
  }
}
