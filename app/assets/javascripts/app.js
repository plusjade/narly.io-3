window.Narly = (function() {
    var Commit = Backbone.Model.extend({
        idAttribute: 'sha'
        ,
        url : function() {
            return '/courses/cucumber/commits/' + this.id + '.json';
        }
        ,
        // TODO: this is only needed to force sync event.
        // Is there a better way? Also we should probably delegate to a cache anyway.
        parse : function(rsp) {
            rsp.commit.entropy = Math.random();
            return rsp.commit;
        }
    })

    var Commits = Backbone.Collection.extend({
        model: Commit
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

    var CommitsView = Backbone.View.extend({
        collection : Commits
        ,
        tagName: "ol"
        ,
        attributes : {
            id: "table-of-contents"
        }
        ,
        initialize : function() {
            var self = this;

            // Left/Right arrow navigation.
            $(document).keydown(function(e) {
                if ([37, 39].indexOf(e.keyCode) > -1) {
                    var direction = (e.keyCode == 37) ? -1 : 1;
                    self.collection.getFromActive(direction).fetch();
                    return false;
                }
            })
        }
        , 
        render : function() {
            var cache = [];
            this.collection.each(function(model) {
              cache.push(new Narly.CommitView({ model : model }).render());
            })
            $.fn.append.apply(this.$el.empty(), cache);

            return this.$el;
        }
    })

    var CommitView = Backbone.View.extend({
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
        }
        ,
        expand : function() {
            this.model.collection.activeId = this.model.id;
            var view = new Narly.CommitFullView({ model : this.model }).render();
            $("#main-commit-container").html(view);
        }
        ,
        active : function() {
            this.$el.siblings('li').removeClass('active');
            this.$el.addClass('active');
        }
    })

    var CommitFullView = Backbone.View.extend({
        model : Commit
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
            var content = Mustache.render(this.template, this.model.attributes);
            return this.$el.html(content);
        }
    })

    var TopBar = Backbone.View.extend({
        collection : Commits
        ,
        events : {
            'click a.prev' : 'prev',
            'click a.next' : 'next'
        }
        ,
        prev : function(e) {
            e.preventDefault();
            this.collection.getPrevFromActive().fetch();
        }
        ,
        next : function(e) {
            e.preventDefault();
            this.collection.getNextFromActive().fetch();
        }
    })
    return {
        env : {}
        ,
        Commit : Commit
        ,
        Commits : Commits
        ,
        CommitsView : CommitsView
        ,
        CommitView : CommitView
        ,
        CommitFullView : CommitFullView
        ,
        TopBar : TopBar
    }
})();
