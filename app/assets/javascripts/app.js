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

    var StepsView = Backbone.View.extend({
        collection : Steps
        ,
        tagName: "ol"
        ,
        attributes : {
            id: "table-of-contents"
        }
        ,
        initialize : function() {
            var self = this;

            Backbone.history.start({ pushState: true, silent: true, hashChange : false });

            // Left/Right arrow navigation.
            $(document).keydown(function(e) {
                if ([37, 39].indexOf(e.keyCode) > -1) {
                    var direction = (e.keyCode == 37) ? -1 : 1;
                    var model = self.collection.getFromActive(direction);
                    Narly.router.update(model.url());
                    model.fetch();
                    Narly.$body.scrollTop(0);

                    return false;
                }
            })
        }
        , 
        render : function() {
            var cache = [];
            this.collection.each(function(model) {
              cache.push(new Narly.StepView({ model : model }).render());
            })
            $.fn.append.apply(this.$el.empty(), cache);

            return this.$el;
        }
    })

    var StepView = Backbone.View.extend({
        tagName: "li"
        ,
        events : {
            'click a' : 'load'
        }
        ,
        initialize : function() {
            this.model.on('change', this.expand, this);
            this.model.on('sync', this.active, this);
        }
        , 
        render : function() {
            var content = Mustache.render('<a href="#">{{ title }}</a>', this.model.attributes);
            return this.$el.html(content);
        }
        , 
        load : function(e) {
            e.preventDefault();
            this.model.fetch();
            Narly.router.update(this.model.url());
            Narly.$body.scrollTop(0);
        }
        ,
        expand : function() {
            this.model.collection.activeId = this.model.id;
            var view = new Narly.StepFullView({ model : this.model }).render();
            $("#main-commit-container").html(view);
        }
        ,
        active : function() {
            this.$el.siblings('li').removeClass('active');
            this.$el.addClass('active');
        }
    })

    var StepFullView = Backbone.View.extend({
        model : Step
        ,
        attributes : {
            id: "commit-container"
        }
        ,
        initialize : function() {
            this.template = $("#commit-container-template").html()
        }
        , 
        render : function() {
            var payload = this.model.attributes;
            payload.hasDiffs = payload.diffs.length > 0;
            var content = Mustache.render(this.template, payload);
            return this.$el.html(content);
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
            var model = this.collection.getPrevFromActive();
            model.fetch();
            Narly.router.update(model.url());
            Narly.$body.scrollTop(0);
        }
        ,
        next : function(e) {
            e.preventDefault();
            var model = this.collection.getNextFromActive();
            model.fetch();
            Narly.router.update(model.url());
            Narly.$body.scrollTop(0);
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
        StepFullView : StepFullView
        ,
        TopBar : TopBar
        ,
        PrevNextView : PrevNextView
        ,
        router : new Router
    }
})();
