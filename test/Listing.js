const { expect } = require('chai');

describe.only('Listing', () => {
    let contract, owner, otherAccount;

    beforeEach(async() => {
        [owner, otherAccount] = await ethers.getSigners();

        const Listing = await ethers.getContractFactory('Listing');
        contract = await Listing.deploy();
    });

    describe('Deployment', () => {
        it('Should set the right owner', async() => {
            const contractOwner = await contract.functions.owner();
            expect(contractOwner[0]).to.equal(owner.address);
        });
    });

    describe('Payment', () => {
        it('Should allow user to pay for the listing', async() => {
            await contract.connect(otherAccount).payForListing({ value: ethers.utils.parseEther('2') });

            const listingPayed = await contract.functions.payers(otherAccount.address);
            expect(listingPayed[0]).to.equal(true);
        });

        it('Should revert when amount is not enough', async() => {
            await expect(contract.connect(otherAccount).payForListing({ value: ethers.utils.parseEther('1') })).to.be.revertedWith(`You haven't paid enough!`);
        });

        it('Should allow owner to list for free', async() => {
            await contract.connect(owner).payForListing();

            const listingPayed = await contract.functions.payers(owner.address);
            expect(listingPayed[0]).to.equal(true);
        });
    });

    describe('Price change', () => {
        it('Should allow owner to change the price', async() => {
            await contract.connect(owner).changeListingPrice('1000000000000000000');

            const listingPrice = await contract.functions.listingPrice();
            expect(listingPrice[0]).to.equal('1000000000000000000');
        });

        it('Should not allow non owner to change the price', async() => {
            await expect(contract.connect(otherAccount).changeListingPrice('1000000000000000000')).to.be.revertedWith(`Only owner can change the price!`);
        });
    });

    describe('Withdrawal', () => {
        it('Should allow owner to withdraw funds', async() => {
            const ownerInitialBalance = Number(ethers.utils.formatEther((await ethers.provider.getBalance(owner.address))));
            await contract.connect(otherAccount).payForListing({ value: ethers.utils.parseEther('2') });
            await contract.connect(owner).withdraw();
            const ownerFinalBalance = Number(ethers.utils.formatEther((await ethers.provider.getBalance(owner.address))));

            expect(ownerFinalBalance).to.be.gt(ownerInitialBalance);
        });

        it('Should not allow non owner to withdraw funds', async() => {
            await contract.connect(otherAccount).payForListing({ value: ethers.utils.parseEther('2') });
            await expect(contract.connect(otherAccount).withdraw()).to.be.revertedWith(`Only owner and developer can withdraw funds!`);
        });
    });
});