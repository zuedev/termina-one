// Global audio context for error sounds
let audioContext = null;
let audioInitialized = false;

// Initialize audio context on first user interaction
function initializeAudio() {
  if (!audioInitialized && !audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioInitialized = true;
    } catch (e) {
      console.warn("Audio context not supported");
    }
  }
}

// Play success sound
function playSuccessSound() {
  // Use vibration on mobile if available
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]); // Double vibration pattern
  }

  // Play success sound on desktop
  if (audioContext && audioInitialized) {
    try {
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = "sine"; // Smoother sound for success
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5 note
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.warn("Failed to play success sound:", e);
    }
  }
}

// Play error sound
function playErrorSound() {
  // Use vibration on mobile if available
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }

  // Play error sound on desktop
  if (audioContext && audioInitialized) {
    try {
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.warn("Failed to play error sound:", e);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.webkitTouchCallout = "none";

  // Initialize audio on any user interaction
  document.addEventListener("click", initializeAudio, { once: true });
  document.addEventListener("keydown", initializeAudio, { once: true });
  document.addEventListener("touchstart", initializeAudio, { once: true });

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
        warpInput.value = "Redirecting...";
        warpInput.style.background = "green";
        warpInput.style.color = "white";
        warpInput.disabled = true;

        // Play success sound
        playSuccessSound();

        // Redirect after a short delay to show the feedback
        setTimeout(() => {
          window.location.href = location[1];
        }, 800);
      } else {
        warpInput.value = "Invalid warp code...";
        warpInput.style.background = "red";
        warpInput.style.color = "white";
        warpInput.disabled = true;

        // Play error sound
        playErrorSound();

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
      document.body.removeChild(overlay);
    }
  });

  warpInput.focus();
}
