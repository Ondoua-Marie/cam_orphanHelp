// Basic interactive behaviour: open donation modal, set target name, show amount
document.addEventListener('DOMContentLoaded', () => {
  // set year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  const donateButtons = document.querySelectorAll('.donate, #donate-cta, #donate-nav');
  const modal = document.getElementById('donation-modal');
  const donationTarget = document.getElementById('donation-target');
  const amountInput = document.getElementById('amount');
  const amountDisplay = document.getElementById('amount-display');
  const amountDisplay2 = document.getElementById('amount-display-2');
  const modalClose = document.querySelector('.modal-close');
  const modalCancel = document.querySelector('.modal-cancel');

  function openModal(name = 'Orphanage') {
    donationTarget.textContent = name;
    modal.setAttribute('aria-hidden', 'false');
    amountInput.value = '';
    amountDisplay.textContent = 'XAF 0';
    amountDisplay2.textContent = 'XAF 0';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
  }

  donateButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-name') || 'Orphanage';
      openModal(name);
    });
  });

  amountInput.addEventListener('input', () => {
    const v = Number(amountInput.value) || 0;
    amountDisplay.textContent = `XAF ${v.toLocaleString()}`;
    amountDisplay2.textContent = `XAF ${v.toLocaleString()}`;
  });

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);

  document.getElementById('donation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = donationTarget.textContent;
    const amount = Number(amountInput.value) || 0;
    const donor = document.getElementById('donor-name').value || 'Anonymous';

    if (amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const records = JSON.parse(localStorage.getItem('donations') || '[]');
    records.push({ orphanage: name, donor, amount, date: new Date().toISOString() });
    localStorage.setItem('donations', JSON.stringify(records));

    alert(`Thanks ${donor}! We recorded your donation of XAF ${amount.toLocaleString()} to ${name} (demo).`);
    closeModal();
  });

});
