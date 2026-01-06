// Dynamic floating notes animation system
// This script automatically positions and animates any number of floating-note elements

const animationNames = [
  'floatRandom1', 'floatRandom2', 'floatRandom3', 'floatRandom4',
  'floatRandom5', 'floatRandom6', 'floatRandom7', 'floatRandom8'
];

const animationDurations = [11, 12, 13, 14, 15, 16, 17, 18];

function initializeFloatingNotes() {
  const floatingNotes = document.querySelectorAll('.floating-note');
  
  floatingNotes.forEach((note, index) => {
    // Skip the first 8 notes as they already have defined positions and animations
    if (index >= 8) {
      // Generate random position
      const top = Math.random() * 80 + 10; // 10% to 90%
      const left = Math.random() * 80 + 10; // 10% to 90%
      
      // Random animation selection
      const animationIndex = Math.floor(Math.random() * animationNames.length);
      const animationName = animationNames[animationIndex];
      const duration = animationDurations[animationIndex];
      const delay = Math.random() * 8; // 0 to 8 seconds delay
      
      // Apply styles
      note.style.top = `${top}%`;
      note.style.left = `${left}%`;
      note.style.animation = `${animationName} ${duration}s ease-in-out infinite`;
      note.style.animationDelay = `${delay}s`;
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFloatingNotes);

// Re-initialize if new floating notes are added dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const addedNodes = Array.from(mutation.addedNodes);
      const hasNewFloatingNotes = addedNodes.some(node => 
        node.nodeType === Node.ELEMENT_NODE && 
        (node.classList?.contains('floating-note') || 
         node.querySelector?.('.floating-note'))
      );
      
      if (hasNewFloatingNotes) {
        // Small delay to ensure DOM is updated
        setTimeout(initializeFloatingNotes, 100);
      }
    }
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Export for potential use in other modules
export { initializeFloatingNotes };
