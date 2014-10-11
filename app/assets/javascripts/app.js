window.Narly = (function() {
    var Step = Backbone.Model.extend({
        idAttribute: 'index'
        ,
        url : function() {
            return this.collection.url() + this.id + '-' + this.get('slug');
        }
        ,
        // TODO: this is only needed to force sync event.
        // Is there a better way? Also we should probably delegate to a cache anyway.
        parse : function(rsp) {
            rsp.step.entropy = Math.random();
            return rsp.step;
        }
    })

    var Steps = Backbone.Collection.extend({
        model: Step
        ,
        url : function() {
            return '/courses/' + this.courseName + '/steps/';
        }
        ,
        getPrevFromActive : function() {
            return this.getFromActive(-1);
        }
        ,
        getNextFromActive : function() {
            return this.getFromActive(1);
        }
        ,
        getFromActive : function(direction) {
            var active = this.get(this.activeId),
                index = this.indexOf(active),
                max = this.length-1;

            index += direction; 

            if(index < 0) {
                index = max;
            }
            else if (index > max) {
                index = 0;
            }

            return this.at(index);
        }
    })

    // Steps collection View
    var StepsView = Backbone.View.extend({
        collection : Steps
        ,
        initialize : function() {
            var self = this;

            this.collection.each(function(model) {
              new Narly.StepView({ model : model });
            })

            Backbone.history.start({ pushState: true, silent: true, hashChange : false });

            // Left/Right arrow navigation.
            $(document).keydown(function(e) {
                if ([37, 39].indexOf(e.keyCode) > -1) {
                    var direction = (e.keyCode == 37) ? -1 : 1;
                    self
                        .collection
                        .getFromActive(direction)
                        .fetch();

                    return false;
                }
            })
        }
    })

    var StepView = Backbone.View.extend({
        model : Step
        ,
        attributes : {
            id: "commit-container"
        }
        ,
        initialize : function() {
            this.model.on('change', this.render, this);
            this.template = $("#commit-container-template").html();
        }
        , 
        render : function() {
            this.model.collection.activeId = this.model.id;

            var payload = this.model.attributes;
            payload.hasDiffs = payload.diffs.length > 0;
            var content = Mustache.render(this.template, payload);
            var view = this.$el.html(content);

            $("#main-commit-container").html(view);

            Narly.router.update(this.model.url());
            Narly.$body.scrollTop(0);
            $("#step-status")
                .text(
                    "step " + (this.model.get('index') + 1)
                    + " of " + Narly.env.commits.length
                );
        }
    })

    var TopBar = Backbone.View.extend({
        events : {
            'click a.toc-toggle' : 'tocToggle'
        }
        ,
        tocToggle : function(e) {
          e.preventDefault();
          $('body').toggleClass('toc-expand');
        }
    });

    var PrevNextView = Backbone.View.extend({
        collection : Steps
        ,
        events : {
            'click a.prev' : 'prev',
            'click a.next' : 'next'
        }
        ,
        prev : function(e) {
            e.preventDefault();
            this
                .collection
                .getPrevFromActive()
                .fetch();
        }
        ,
        next : function(e) {
            e.preventDefault();
            this
                .collection
                .getNextFromActive()
                .fetch();
        }
    })

    var Router = Backbone.Router.extend({

      routes: {
        "courses/:course_id/steps/:step": "step"
      }
      ,
      step: function(course_id, step) {
        var model = Narly.env.commits.at(step.split('-')[0]);
        if (model) {
            model.fetch();
        }
      }
      ,
      update : function(url) {
        if (Modernizr && Modernizr.history) {
            this.navigate(url, { trigger: false });
        }
      }
    });


    return {
        $body : $('body')
        ,
        env : {}
        ,
        Step : Step
        ,
        Steps : Steps
        ,
        StepsView : StepsView
        ,
        StepView : StepView
        ,
        TopBar : TopBar
        ,
        PrevNextView : PrevNextView
        ,
        router : new Router
    }
})();
