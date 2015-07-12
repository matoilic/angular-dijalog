/* global angular */
/* global define */
/* global dijalog */

(function() {
    var theme = 'dijalog-theme-default';

    function AngularDijalog($compile, $templateRequest, $q, $rootScope) {
        this.$compile = $compile;
        this.$templateRequest = $templateRequest;
        this.$q = $q;
        this.$defaultScope = $rootScope;
    }

    AngularDijalog.prototype = {
        alert: function(options, $scope) {
            if (options && options.substr) {
                options = {
                    message: options
                };
            }

            this._dijalog('alert', options, $scope || this.$defaultScope);
        },

        close: function(id) {
            dijalog.close(id);
        },

        confirm: function(options, $scope) {
            this._dijalog('confirm', options, $scope || this.$defaultScope);
        },

        _createButton: function(positive, label, options) {
            var base = dijalog.defaultDialogOptions.buttons[positive ? 0 : 1];

            return dijalog.helpers.assign({}, base, {text: label}, options || {});
        },

        createNoButton: function(label, options) {
            return this._createButton(false, label, options);
        },

        createYesButton: function(label, options) {
            return this._createButton(true, label, options);
        },

        prompt: function(options, $scope) {
            this._dijalog('prompt', options, $scope || this.$defaultScope);
        },

        _renderTemplate: function(templateUrl, $scope, variables) {
            var deferred = this.$q.defer();
            var _this = this;

            this.$templateRequest(templateUrl, false).then(function(response) {
                deferred.resolve(_this._renderTemplateString(response, $scope, variables));
            });

            return deferred.promise;
        },

        _renderTemplateString: function(template, $scope, variables) {
            var compiledTemplate = this.$compile(template);
            var childScope = $scope.$new();

            childScope = dijalog.helpers.assign(childScope, variables || {});

            return {
                node: compiledTemplate(childScope)[0],
                scope: childScope
            };
        },

        _dijalog: function(dialogType, options, $scope) {
            var originalAfterClose = options.afterClose;
            var renderingDefer = this.$q.defer();
            var childScopes = [];
            var templateRequests = [renderingDefer.promise];
            var renderedTemplate;

            options.className = (options.className || '') + ' ' + theme;

            if (options.messageTemplate) {
                templateRequests.push(
                    this
                        ._renderTemplate(options.messageTemplate, $scope, options.messageTemplateVariables)
                        .then(function(result) {
                            options.message = result.node;
                            childScopes.push(result.scope);
                        })
                );
            } else if (options.messageTemplateString) {
                renderedTemplate = this._renderTemplateString(
                    options.messageTemplateString,
                    $scope,
                    options.messageTemplateVariables
                );

                options.message = renderedTemplate.node;
                childScopes.push(renderedTemplate.scope);
            }

            if (options.inputTemplate) {
                templateRequests.push(
                    this
                        ._renderTemplate(options.inputTemplate, $scope, options.inputTemplateVariables)
                        .then(function(result) {
                            options.input = result.node;
                            childScopes.push(result.scope);
                        })
                );
            } else if (options.inputTemplateString) {
                renderedTemplate = this._renderTemplateString(
                    options.inputTemplateString,
                    $scope,
                    options.inputTemplateVariables
                );

                options.input = renderedTemplate.node;
                childScopes.push(renderedTemplate.scope);
            }

            this.$q.all(templateRequests).then(function() {
                options.afterClose = function() {
                    childScopes.forEach(function(scope) {
                        scope.$destroy();
                    });

                    if (originalAfterClose) {
                        originalAfterClose.apply();
                    }
                };

                dijalog[dialogType](options);
            });

            renderingDefer.resolve();
        }
    };

    function dijalogProvider() {
        this.setTheme = function(t) {
            theme = t;
        };

        this.$get = [
            '$compile',
            '$templateRequest',
            '$q',
            '$rootScope',
            function($compile, $templateRequest, $q, $rootScope) {
                return new AngularDijalog($compile, $templateRequest, $q, $rootScope);
            }
        ];
    }

    angular
        .module('dijalog', [])
        .provider('dijalog', [dijalogProvider]);

    if(typeof define === 'function' && define.amd) {
        define(function() {
            return 'dijalog';
        });
    } else if(typeof exports === 'object') {
        module.exports = 'dijalog';
    }
})();
