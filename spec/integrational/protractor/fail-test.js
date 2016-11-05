describe('angularjs homepage', function() {
    it('should failure', function() {
        browser.get('http://www.angularjs.org');
        element(by.model('yourName')).sendKeys('Andrej');
        var greeting = element(by.binding('yourName'));
        expect(greeting.getText()).toEqual('Hello Martin!');
    });

    it('should pass', function() {
        browser.get('http://www.angularjs.org');
        element(by.model('yourName')).sendKeys('Julie');
        var greeting = element(by.binding('yourName'));
        expect(greeting.getText()).toEqual('Hello Julie!');
    });
});
