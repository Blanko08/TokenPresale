const Token = artifacts.require("Token");
const Presale = artifacts.require("Presale");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
    return web3.utils.toWei(n, 'Ether');
}

contract('Presale', ([owner, investor, investor2]) => {
    let token, presale;

    before(async () => {
        // Load Contracts
        token = await Token.new();
        presale = await Presale.new(token.address);

        // Transfiere 1000000 tokens al contrato de la preventa.
        await token.transfer(presale.address, tokens('1000000'));

        await presale.startPresale(3600);
    });

    describe('Deployment', async () => {
        it('Token Deploys Successfully', async () => {
            const address = await token.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('Presale Deploys Successfully', async () => {
            const address = await presale.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('Presale has tokens', async () => {
            let balance = await token.balanceOf(presale.address);
            assert.equal(balance.toString(), tokens('1000000'));
        });
    });

    describe('Presale', async () => {
        it('Add to Whitelist', async () => {
            let whitelisted;

            await presale.addToWhitelist([investor], {from: owner});
            whitelisted = await presale.whitelist(investor);

            assert.equal(whitelisted, true);
        });

        it('Buy', async () => {
            let result;

            // Comprobar el balance del inversor antes de hacer la compra.
            result = await token.balanceOf(investor);
            assert.equal(result.toString(), tokens('0'), 'El balance del inversor tiene que ser correcto antes de hacer la compra.');

            await presale.invest({from: investor, value: tokens('1')});

            // Comprobar que el balance de tokens en la cuenta del inversor han aumentado.
            result = await token.balanceOf(investor);
            assert.equal(result.toString(), tokens('750'), 'El balance del inversor tiene que ser correcto después de hacer la compra');

            // Comprobar que un inversor que no está en la whitelist no pueda comprar.
            await presale.invest({from: investor2, value: tokens('1')}).should.be.rejected;

            // Comprobar que un inversor no puede invertir más de 5 BNB.
            await presale.invest({from: investor, value: tokens('2')});
            await presale.invest({from: investor, value: tokens('3')}).should.be.rejected;
        });

        it('Withdraw BNBs', async () => {
            let balance;
            
            await presale.withdrawBnbs();
            balance = await web3.eth.getBalance(presale.address);

            assert.equal(balance.toString(), tokens('0'), 'El balance de BNBs del contrato debe ser 0.');
        });
    });

});