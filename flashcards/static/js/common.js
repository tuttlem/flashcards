
var FC = (function ($) {
   var self = {};

   /**************************************************
    Network communications
    **************************************************/

   var sendAjax = function (url, type, data, fnSuccess, fnError, fnComplete) {
      $.ajax({
         url: url,
         type: type,
         complete: fnComplete,
         data: data,
         dataType: "json",
         error: fnError,
         success: fnSuccess
      });
   };

   self.sendGet = function (url, fnSuccess, fnError, fnComplete) {
      sendAjax(url, "GET", undefined, fnSuccess, fnError, fnComplete);
   };

   self.sendPost = function (url, data, fnSuccess, fnError, fnComplete) {
      sendAjax(url, "POST", ko.toJSON(data), fnSuccess, fnError, fnComplete);
   };

   /**************************************************
    Application data library
    **************************************************/

   self.retrieveTypes = function (fnSuccess, fnError, fnComplete) {
      self.sendGet(URI.retrieveTypes, fnSuccess, fnError, fnComplete);
   };

   self.retrieveQuestions = function (subject, fnSuccess, fnError, fnComplete) {
      self.sendGet(URI.data + "/" + subject.file, fnSuccess, fnError, fnComplete);
   }

   /**************************************************
    User interface helpers
    **************************************************/

   var infoModalOpen = false;

   self.showInfo = function (title, text) {

      $("#infoModalLabel").text(title);
      $("#infoModalText").text(text);

      if (!infoModalOpen) {
         infoModalOpen = true;
         $("#infoModal").modal({ keyboard: false });
      }

   };

   self.hideInfo = function () {
      if (infoModalOpen) {
         infoModalOpen = false;
         $("#infoModal").modal("hide");
      }
   };

   return self;
})(jQuery);

ko.validation.configure({
   insertMessages: false,
   decorateElement: true,
   errorElementClass: 'has-error',
   errorMessageClass: 'help-inline'
});
