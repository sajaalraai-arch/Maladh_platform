/* ===== بطاقات الخدمات: تأثير الطبقة الزجاجية عند المرور / اللمس ===== */
(function () {
  const cards = $$('[data-card]');
  const setOpen = (card, open) => {
    card.classList.toggle('is-open', open);
    $('.card-toggle', card).setAttribute('aria-expanded', String(open));
  };
  const closeAll = (except) => cards.forEach((c) => { if (c !== except) setOpen(c, false); });

  cards.forEach((card) => {
    // الضغطة الأولى تُظهر الزر فقط ولا توجّه المستخدم مباشرة
    $('.card-toggle', card).addEventListener('click', () => {
      const willOpen = !card.classList.contains('is-open');
      closeAll(card);
      setOpen(card, willOpen);
    });
    $('.overlay-close', card).addEventListener('click', () => { setOpen(card, false); $('.card-toggle', card).focus(); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-card]')) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
})();
