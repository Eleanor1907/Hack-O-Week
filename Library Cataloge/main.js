// --- Data ---
const booksData = [
  { id: 1, title: 'The Chronos Spellbook', author: 'Ignatius Pendelton', genre: 'spells', year: 1243, desc: 'A worn leather-bound tome containing incantations relating to the manipulation of localized time fields. Handle with extreme caution.' },
  { id: 2, title: 'History of the Alchemian Order', author: 'Brother Thomas', genre: 'history', year: 1492, desc: 'Detailed accounts of the first alchemists who discovered the properties of philosophers stone and their subsequent disappearance.' },
  { id: 3, title: 'Botanical Enchantments', author: 'Sylvia Greenleaf', genre: 'science', year: 1805, desc: 'An extensive categorisation of magical flora. Contains detailed illustrations drawn with glowing ink.' },
  { id: 4, title: 'Legends of the Deep Woods', author: 'Anonymous', genre: 'fiction', year: 950, desc: 'Collected folklore concerning the entities that reside in the old growth forests of the northern realms.' },
  { id: 5, title: 'Principles of Levitation', author: 'Archibald Sky', genre: 'spells', year: 1612, desc: 'Theoretical and practical guide to suspending objects and living beings in the air. Master-level mastery required.' },
  { id: 6, title: 'The Celestial Alignments', author: 'Astronomer Elaris', genre: 'science', year: 1337, desc: 'Maps and charts detailing the movement of stars and their influence on arcane energies.' },
  { id: 7, title: 'Tales of the Dragon Lords', author: 'Sir Reginald', genre: 'fiction', year: 1102, desc: 'Epic narratives covering the rise and fall of the great dragon tamers of the first age.' }
];

document.addEventListener('DOMContentLoaded', () => {

  // --- Elements ---
  const introScreen = document.getElementById('intro-screen');
  const libraryInterface = document.getElementById('library-interface');
  const openBtn = document.getElementById('open-btn');
  
  const searchInput = document.getElementById('search-input');
  const categoriesList = document.getElementById('categories-list');
  const categoryItems = document.querySelectorAll('.category-item');
  const booksGrid = document.getElementById('books-grid');
  const currentCategoryTitle = document.getElementById('current-category');
  const bookCount = document.getElementById('book-count');
  
  const detailModal = document.getElementById('detail-modal');
  const closeModalBtn = document.getElementById('close-modal');
  
  // --- Audio Logic ---
  const bgAudio = document.getElementById('bg-audio');
  const audioToggle = document.getElementById('audio-toggle');
  let isPlaying = false;
  
  // Set volume slightly lower for study vibe
  bgAudio.volume = 0.4;

  audioToggle.addEventListener('click', () => {
    if (isPlaying) {
      bgAudio.pause();
      audioToggle.textContent = '🎵 Play Music';
      audioToggle.classList.remove('playing');
    } else {
      bgAudio.play().catch(console.error);
      audioToggle.textContent = '⏸ Pause Music';
      audioToggle.classList.add('playing');
    }
    isPlaying = !isPlaying;
  });

  // --- Opening the Book ---
  openBtn.addEventListener('click', () => {
    // Hide intro
    introScreen.classList.add('hidden');
    // Show library
    libraryInterface.classList.remove('hidden');
    
    // Note: We DO NOT autoplay audio here as per user request.
  });

  // --- Filtering & Rendering ---
  let activeCategory = 'all';

  function renderBooks() {
    // Clear current
    booksGrid.innerHTML = '';
    
    const query = searchInput.value.toLowerCase().trim();
    
    // Filter logic
    const filtered = booksData.filter(book => {
      const matchCategory = (activeCategory === 'all') || (book.genre === activeCategory);
      const matchSearch = book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });

    // Update count
    bookCount.textContent = `${filtered.length} items`;

    if (filtered.length === 0) {
      booksGrid.innerHTML = '<p style="color:var(--text-light); text-align:center; grid-column: 1/-1;">No archives found matching your criteria.</p>';
      return;
    }

    // Render cards
    filtered.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';
      
      const title = document.createElement('div');
      title.className = 'book-title';
      title.textContent = book.title;
      
      const author = document.createElement('div');
      author.className = 'book-author';
      author.textContent = `By ${book.author}`;
      
      card.appendChild(title);
      card.appendChild(author);
      
      // Event listener to open modal
      card.addEventListener('click', () => openBookModal(book));
      
      booksGrid.appendChild(card);
    });
  }

  // Handle Search input
  searchInput.addEventListener('input', () => {
    renderBooks();
  });

  // Handle Category click
  categoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Remove active from all
      categoryItems.forEach(i => i.classList.remove('active'));
      // Add active to clicked
      e.currentTarget.classList.add('active');
      
      // Update state
      activeCategory = e.currentTarget.getAttribute('data-category');
      currentCategoryTitle.textContent = e.currentTarget.textContent;
      
      renderBooks();
    });
  });

  // --- Modal Logic ---
  function openBookModal(book) {
    document.getElementById('modal-title').textContent = book.title;
    document.getElementById('modal-author').textContent = `By ${book.author}`;
    document.getElementById('modal-desc').textContent = book.desc;
    
    const metaContainer = document.getElementById('modal-meta');
    metaContainer.innerHTML = '';
    
    const genreBadge = document.createElement('span');
    genreBadge.textContent = `Realm: ${book.genre.toUpperCase()}`;
    const yearBadge = document.createElement('span');
    yearBadge.textContent = `Era: ${book.year}`;
    
    metaContainer.appendChild(genreBadge);
    metaContainer.appendChild(yearBadge);
    
    // Show modal
    detailModal.classList.remove('hidden');
    // Prevent background scrolling on mobile
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    detailModal.classList.add('hidden');
    // Restore scrolling
    document.body.style.overflow = 'auto';
  }

  closeModalBtn.addEventListener('click', closeModal);
  
  // Close if clicked outside content container
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeModal();
    }
  });

  // Initial render
  renderBooks();
});
