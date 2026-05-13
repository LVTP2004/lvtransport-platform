(function(){
  var target = document.documentElement.getAttribute('data-target') || '/';
  if (window.location.pathname !== target) {
    window.location.replace(target);
  }
})();
