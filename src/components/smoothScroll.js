/* eslint-disable jquery/no-animate */
/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-is */
/* eslint-disable jquery/no-class */

// if (!('scrollBehavior' in document.documentElement.style)) {

//   $('a[href*="#"]')

//     .not('[href="#"]')
//     .not('[href="#0"]')
//     .not('[class="js-schedule-scroll-link"]')
//     .click(function(event) {

//       if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

//         var target = $(this.hash);
//         target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

//         if (target.length) {

//           event.preventDefault();
//           $('html, body').animate(
//             {
//               scrollTop: target.offset().top,
//             },
//             1000,
//             function() {

//               var $target = $(target);
//               $target.focus();
//               if ($target.is(':focus')) {

//                 return false;
//               } else {
//                 $target.attr('tabindex', '-1');
//                 $target.focus();
//               }
//             }
//           );
//         }
//       }
//     });
// }
