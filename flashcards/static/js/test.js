
var ConfigureTest = function () {
   var self = this;

   self.errors = ko.validation.group(self);

   self.subjects = ko.observableArray();
   self.testTypes = ko.observableArray();
   self.sampleSizes = ko.observableArray();
   self.durations = ko.observableArray();

   self.isConfiguring = ko.observable(true);

   self.subject = ko.observable().extend({ required: true });
   self.testType = ko.observable().extend({ required: true });

   self.needsSample = ko.computed(function () {
      return self.testType() != null && self.testType().name == "Standard";
   }, self);

   self.needsDuration = ko.computed(function () {
      return self.testType() != null && self.testType().name == "Speed Test";
   }, self);

   self.sampleSize = ko.observable().extend({
      required: {
         onlyIf: function () { return self.needsSample(); }
      }
   });
   self.duration = ko.observable().extend({
      required: {
         onlyIf: function () { return self.needsDuration(); }
      }
   });

   self.init = function () {

      FC.showInfo("Please wait", "Loading test information . . .");

      FC.retrieveTypes(
         function (data) {
            self.subjects(data.subjects);
            self.testTypes(data.types);
            self.sampleSizes(data.sampleSizes);
            self.durations(data.durations);
         },
         function (xhr, status, error) { },
         function () {
            FC.hideInfo();
         }
      );

   };

};

var TestViewModel = function () {
   var self = this;

   self.viewMode = ko.observable("configure");

   self.configurator = ko.validatedObservable(new ConfigureTest());

   self.questions = ko.observableArray([]);
   self.questionIndex = ko.observable(0);
   self.questionCount = ko.observable(0);
   self.answerSet = ko.observableArray([]);
   self.distinctAnswers = new Array();

   self.answered = ko.observableArray([]);

   self.startTime = new Date();
   self.timer = null;

   self.setViewMode = function (viewMode) {
      self.viewMode(viewMode);
   };

   self.questionHeader = ko.computed(function () {
      return "Question #" + (self.questionCount());
   }, self);

   self.currentQuestion = ko.computed(function () {
      if (self.questions().length == 0) {
         return null;
      }

      return self.questions()[self.questionIndex()];
   }, self);

   self.startTest = function () {

      if (!self.configurator.isValid()) {
         self.configurator().errors.showAllMessages();
      } else {

         FC.showInfo("Please wait", "Loading question set . . .");

         // clear out the question set
         self.questions.removeAll();
         self.answered.removeAll();
         self.distinctAnswers = [];

         FC.retrieveQuestions(
            self.configurator().subject(),

            function (data) {
               // map each question into the set
               self.questions(data.questions);
               self.questionCount(0);

               // calculate a distinct set of answers from all questions
               self.questions().forEach(function (q) {
                  if (self.distinctAnswers.find(function (a) { return a.textCopy === q.answer.textCopy; }) == null) {
                     self.distinctAnswers.push(q.answer);
                  }
               });

               self.newQuestion();

               if (self.configurator().needsDuration()) {
                  self.startTime = new Date();
                  setTimeout(
                     function () { 
                        self.setViewMode("finished");
                     },
                     self.configurator().duration().duration * 1000
                  );
               }

               self.setViewMode("running");
            },

            function (xhr, status, error) { },

            function () {
            }
         );

      }

   };

   self.newQuestion = function () {
      self.questionIndex(Math.floor(Math.random() * self.questions().length));
      self.questionCount(self.questionCount() + 1);
      self.answerSet(self.makeAnswers());
   };

   self.answersMatch = function (a1, a2) {
      return (a1 != null && a2 != null && a1.textCopy == a2.textCopy);
   };

   self.makeAnswers = function () {

      var shuffle = function (o) { 
         for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
         return o;
      };

      var answers = new Array();
      answers.push(self.currentQuestion().answer);
 
      // add two "noise" answers to the set, so that we can confuse the user (a little)
      // TODO: this loop needs to change . . . if they're aren't enough distinct answers
      //       available in the configured test, the loop will just go on forever
      while (answers.length <= 2) {
 
         var potential = self.distinctAnswers[Math.floor(Math.random() * self.distinctAnswers.length)];
 
         if (answers.find(function (a) { return a.textCopy == potential.textCopy; }) == null) {
            answers.push(potential);
         }
      }

      return shuffle(answers);
   };

   self.answerQuestion = function (answer) {

      // pop the user's answer along with the source question into the results array that
      // we'll analyse later (to give the user some feedback)
      self.answered.push({
         q: self.currentQuestion(),
         a: answer
      });

      // check if we're done
      if (self.finished()) {

         self.setViewMode("finished");
         return ;

      }

      // get a new question
      self.newQuestion();
   };

   self.finished = function () {

      if (self.configurator().needsSample()) {
         // check if we've answered enough questions
         return self.answered().length >= self.configurator().sampleSize().count;

      } else if (self.configurator().needsDuration()) {
         return false;
      }

      return true;

   };

   self.isCorrect = function (item) {
      var actual = item.q.answer;
      var potential = item.a;

      return actual.textCopy == potential.textCopy;
   };

   self.sameAgain = function () {
      self.startTest();
   };

   self.configureTest = function () {
      self.setViewMode("configure");
   };

   self.configurator().init();
};

ko.applyBindings(new TestViewModel());
