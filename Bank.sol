/// @title Bank
/// @author Andreas Olofsson (andreas@erisindustries.com)
contract Bank {

    // The bank account struct.
    struct Account {
        address owner;
        uint balance;
    }

    // Null address
    address constant ADDRESS_NULL = 0;

    // Error codes.

    // General
    uint8 constant SUCCESS = 0; // Success
    // Account related.
    uint8 constant NO_ACCOUNT = 10; // Caller has no account.
    uint8 constant ACCOUNT_EXISTS = 11; // Caller already has an account.
    uint8 constant NO_TARGET = 12; // Recipient does not have an account.
    uint8 constant NOT_OWNER = 13; // Caller is not owner of bank.
    uint8 constant NOT_ACCOUNT_OWNER = 14; // Caller is not owner of bank account.
    uint8 constant INVALID_NAME = 15; // Name is invalid.
    // Balance related
    uint8 constant NO_AMOUNT = 20; // Transacted amount is 0
    uint8 constant INSUFFICIENT_BALANCE = 21; // Insufficient balance.

    // Fields

    // The owner of the contract.
    address public owner;

    // The accounts.
    mapping(bytes32 => Account) accounts;
    mapping(address => bytes32) public names;


    event LogPaymentBusMade(bytes32 accountId, uint amount, bytes32 busId);

    // Constructor
    function Bank(){
        owner = msg.sender;
    }

    /// @dev Registers if not already registered.
    /// @param name - the user name.
    /// @return Error code. INVALID_NAME || ACCOUNT_EXISTS || ADDRESS_EXISTS || SUCCESS
    function registerNewAccount(bytes32 name) external returns (uint16 result) {
        if (name == "")
            return INVALID_NAME;
        if (names[msg.sender] != "")
            return ACCOUNT_EXISTS;
        accounts[name] = Account(msg.sender, 0);
        names[msg.sender] = name;
        return SUCCESS;
    }

    /// @dev Deletes an existing account. This can be done only by the bank owner or the owner of the account.
    /// @param name - the user name.
    /// @return Error code. NO_ACCOUNT || NOT_ACCOUNT_OWNER || SUCCESS
    function deleteAccount(bytes32 name) external returns (uint16 results) {
        var acc = accounts[name];
        var accOwner = acc.owner;

        if (accOwner == ADDRESS_NULL)
            return NO_ACCOUNT;
        if (accOwner != msg.sender && msg.sender != owner)
            return NOT_ACCOUNT_OWNER;

        delete accounts[name];

        if (msg.sender != owner || (msg.sender == owner && acc.owner == owner)) {
            delete names[msg.sender];
        }
        return SUCCESS;
    }

    /// @dev Used by the owner to endow an account with GhavCoin
    /// @param user The user name.
    /// @param amount The amount.
    /// @param message The message.
    /// @return Error code. NO_AMOUNT || NOT_OWNER || NO_TARGET || SUCCESS
    function endow(bytes32 user, uint amount, bytes32 message) external returns (uint16 result) {
        if (amount == 0)
            return NO_AMOUNT;
        if (msg.sender != owner)
            return NOT_OWNER;
        var account = accounts[user];

        
        accounts[user].balance += amount;
        return SUCCESS;
    }

    function payment(bytes32 user, uint amount, bytes32 message) external returns (uint16 result) {
        if (amount == 0)
            return NO_AMOUNT;
        if (msg.sender != owner)
            return NOT_OWNER;
        var account = accounts[user];

        if (accounts[user].balance < amount) {
            return INSUFFICIENT_BALANCE;
        }else {
            accounts[user].balance -= amount;
            LogPaymentBusMade(user, amount, 123456789);
            return SUCCESS;
        }
    }

    /// @dev Transfer Ghavcoin between accounts. The sender is always the account that called the function.
    /// @param to The recipients public address.
    /// @param amount The amount.
    /// @param message The message.
    /// @return Error code. NO_AMOUNT || INSUFFICIENT_BALANCE || NO_ACCOUNT || NO_TARGET || SUCCESS
    function transfer(bytes32 to, uint amount, bytes32 message) external returns (uint16 result) {

        if (amount == 0)
            return NO_AMOUNT;

        var sndr = names[msg.sender];

        if (sndr == "")
            return NO_ACCOUNT;

        var account = accounts[sndr];

        if (account.owner == ADDRESS_NULL)
            return NO_ACCOUNT;
        // TODO should be a check that user isn't transferring to himself, and an error to go with it.

        if (account.balance < amount)
            return INSUFFICIENT_BALANCE;

        var target = accounts[to];
        if (target.owner == ADDRESS_NULL)
            return NO_TARGET;
        else {
            target.balance += amount;
            account.balance -= amount;
        }
    }

    /// @dev Get the balance of a user account.
    /// @param user The users public address.
    /// @return The users current balance (non existing users would have 0).
    function getBalance(bytes32 user) external returns (uint accountBalance) {
         return accounts[user].balance;
    }

    // Convenience method.
    function getMyAddress() external returns (address myAddress) {
        myAddress = msg.sender;
        return;
    }

    // Convenience method.
    function getMyName() external returns (bytes32 myName) {
        myName = names[msg.sender];
        return;
    }

    /// @dev Used by the owner to remove (suicide) the contract.
    function remove() external {
        if(msg.sender == owner)
            suicide(owner);
    }

}
