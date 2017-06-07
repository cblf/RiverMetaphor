$(function () {
    app.initialize();

    // Activer Knockout
    ko.validation.init({ grouping: { observable: false } });
    ko.applyBindings(app);
});
