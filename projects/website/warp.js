document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "w") {
      event.preventDefault();
      warp();
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
  document.body.appendChild(warpInput);

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
        // don't allow further input
        warpInput.disabled = true;
        // play error sound
        const errorSoundContext = new AudioContext();
        const oscillator = errorSoundContext.createOscillator();
        const gainNode = errorSoundContext.createGain();
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(440, errorSoundContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, errorSoundContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(errorSoundContext.destination);
        oscillator.start();
        oscillator.stop(errorSoundContext.currentTime + 0.2);
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
    }
  });

  warpInput.focus();
}
