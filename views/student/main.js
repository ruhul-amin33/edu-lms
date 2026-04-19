// Auto-hide alerts
document.querySelectorAll('.error-msg').forEach(el => {
  setTimeout(() => el.style.display = 'none', 5000);
});