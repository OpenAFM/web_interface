$('nav li').on('click', 'a', function(e) {
  e.preventDefault();
  var url = $(this).attr('href');

  setPage(url);
});

function setPage(url) {
  console.log('Loading:', url);
  $('li').removeClass('active');
  $.ajax({
    url: url,
    success: function(response) {
      $('#content').html(response);
      $('a[href="'+url+'"]').parent().addClass('active');
    }
  });
}

setPage('/tabs/interface.html');
