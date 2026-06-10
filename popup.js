const notesEl = document.getElementById('notes');
const statusEl = document.getElementById('status');
const clearBtn = document.getElementById('clearBtn');

let saveTimer;

// Popup kholte hi purani notes load karo
chrome.storage.local.get(['notes'], (result) => {
  notesEl.value = result.notes || '';
});

// Likhte jaao, auto-save hota jayega (600ms baad)
notesEl.addEventListener('input', () => {
  statusEl.textContent = 'Saving...';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    chrome.storage.local.set({ notes: notesEl.value }, () => {
      statusEl.textContent = 'Saved ✓';
    });
  }, 600);
});

// Clear button
clearBtn.addEventListener('click', () => {
  if (confirm('Saari notes delete karein?')) {
    notesEl.value = '';
    chrome.storage.local.set({ notes: '' });
    statusEl.textContent = 'Cleared';
  }
});
