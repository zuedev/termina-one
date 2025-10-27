document.addEventListener("DOMContentLoaded", () => {
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.webkitTouchCallout = "none";

  document.addEventListener("keydown", (event) => {
    if (event.key === "w") {
      event.preventDefault();
      warp();
    }
  });

  // Add mobile support with touch gesture
  let touchStartTime = 0;
  let touchCount = 0;

  document.addEventListener("touchstart", (event) => {
    const currentTime = Date.now();
    if (currentTime - touchStartTime < 500) {
      touchCount++;
    } else {
      touchCount = 1;
    }
    touchStartTime = currentTime;

    // Triple tap to open warp
    if (touchCount === 3) {
      event.preventDefault();
      warp();
      touchCount = 0;
    }
  });
});

function warp() {
  const warpLocations = [
    ["96", "https://96.zue.dev/"],
    ["github", "https://github.com/zuedev/termina-one"],
  ];

  const warpInput = document.createElement("input");
  warpInput.type = "text";
  warpInput.placeholder = "Type a warp code...";
  warpInput.style.position = "absolute";
  warpInput.style.top = "50%";
  warpInput.style.left = "50%";
  warpInput.style.transform = "translate(-50%, -50%)";
  warpInput.style.padding = "0.5rem";
  warpInput.style.fontFamily = getComputedStyle(
    document.documentElement
  ).fontFamily;
  warpInput.style.zIndex = "1000";
  warpInput.style.fontSize = "16px"; // Prevent zoom on iOS
  warpInput.style.width = "80%";
  warpInput.style.maxWidth = "300px";
  document.body.appendChild(warpInput);

  // Add click outside to close functionality
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "999";
  overlay.style.backgroundColor = "transparent";
  document.body.appendChild(overlay);

  // Delay adding the event listener to avoid immediate trigger
  setTimeout(() => {
    overlay.addEventListener("click", () => {
      document.body.removeChild(warpInput);
      document.body.removeChild(overlay);
    });
  }, 100);

  // Prevent clicks on the input from closing the warp
  warpInput.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  warpInput.addEventListener("keydown", (event) => {
    if (event.key === "w") {
      event.stopPropagation();
    }

    if (event.key === "Enter") {
      const query = warpInput.value.toLowerCase();
      const location = warpLocations.find(
        ([name]) => name.toLowerCase() === query
      );
      if (location) {
        window.location.href = location[1];
      } else {
        warpInput.value = "Invalid warp code...";
        warpInput.style.background = "red";
        warpInput.style.color = "white";
        warpInput.disabled = true;

        // Use vibration instead of sound on mobile if available
        if (navigator.vibrate) {
          navigator.vibrate(200);
        } else {
          // Fallback to sound
          const errorSoundContext = new AudioContext();
          const oscillator = errorSoundContext.createOscillator();
          const gainNode = errorSoundContext.createGain();
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(
            440,
            errorSoundContext.currentTime
          );
          gainNode.gain.setValueAtTime(0.1, errorSoundContext.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(errorSoundContext.destination);
          oscillator.start();
          oscillator.stop(errorSoundContext.currentTime + 0.2);
        }

        setTimeout(() => {
          warpInput.style.background = "white";
          warpInput.style.color = "black";
          warpInput.value = "";
          warpInput.disabled = false;
          warpInput.focus();
        }, 1000);
      }
    }

    if (event.key === "Escape") {
      document.body.removeChild(warpInput);
      document.body.removeChild(closeButton);
    }
  });

  warpInput.focus();
}
