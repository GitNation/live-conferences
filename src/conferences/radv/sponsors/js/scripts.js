
/*
* Placeholder plugin for jQuery
* ---
* Copyright 2010, Daniel Stocks (http://webcloud.se)
* Released under the MIT, BSD, and GPL Licenses.
*/
$(function(){(function(e){function t(t){this.input=t;if(t.attr("type")=="password"){this.handlePassword()}e(t[0].form).submit(function(){if(t.hasClass("placeholder")&&t[0].value==t.attr("placeholder")){t[0].value=""}})}t.prototype={show:function(e){if(this.input[0].value===""||e&&this.valueIsPlaceholder()){if(this.isPassword){try{this.input[0].setAttribute("type","text")}catch(t){this.input.before(this.fakePassword.show()).hide()}}this.input.addClass("placeholder");this.input[0].value=this.input.attr("placeholder")}},hide:function(){if(this.valueIsPlaceholder()&&this.input.hasClass("placeholder")){this.input.removeClass("placeholder");this.input[0].value="";if(this.isPassword){try{this.input[0].setAttribute("type","password")}catch(e){}this.input.show();this.input[0].focus()}}},valueIsPlaceholder:function(){return this.input[0].value==this.input.attr("placeholder")},handlePassword:function(){var t=this.input;t.attr("realType","password");this.isPassword=true;if(e.browser.msie&&t[0].outerHTML){var n=e(t[0].outerHTML.replace(/type=(['"])?password\1/gi,"type=$1text$1"));this.fakePassword=n.val(t.attr("placeholder")).addClass("placeholder").focus(function(){t.trigger("focus");e(this).hide()});e(t[0].form).submit(function(){n.remove();t.show()})}}};var n=!!("placeholder"in document.createElement("input"));e.fn.placeholder=function(){return n?this:this.each(function(){var n=e(this);var r=new t(n);r.show(true);n.focus(function(){r.hide()});n.blur(function(){r.show(false)});if(e.browser.msie){e(window).load(function(){if(n.val()){n.removeClass("placeholder")}r.show(true)});n.focus(function(){if(this.value==""){var e=this.createTextRange();e.collapse(true);e.moveStart("character",0);e.select()}})}})}})(jQuery)});


$(function () {

  // Burger menu

  $('.menu-toggle').click(function () {
    $(this).toggleClass('open');
    $(this).siblings('.main-menu').toggleClass('open');
  });

  // Sticky header

  $(window).scroll(function () {
    var winTop = $(window).scrollTop();
    if (winTop > 0) {
      $("header").addClass("sticky-header");
    } else {
      $("header").removeClass("sticky-header");
    }
  });

  // Anchor navigation

  $('a[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      var _this = this;
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 400, function () {
          location.hash = _this.hash;
        });
        return false;
      }
    }
  });

  /*---------------------------------------------------*/

  $('input[placeholder], textarea[placeholder]').placeholder();


});
