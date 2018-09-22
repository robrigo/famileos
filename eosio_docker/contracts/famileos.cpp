#include <eosiolib/eosio.hpp>

class famileos : public eosio::contract {
   public:
      famileos( account_name s ):
         contract( s ),   // initialization of the base class for the contract
         _records( s, s ) // initialize the table with code and scope NB! Look up definition of code and scope   
      {
      }

      /// @abi action
      void create(account_name account, account_name contract, action_name action) {

         require_auth(account);

          // find items which are for the named poll
          for(auto& item : _records) {
            eosio_assert(item.account != account && item.contract != contract && item.action != action, "Record already exists");
          }

         _records.emplace(account, [&]( auto& rcrd ) {
            rcrd.account    = account;
            rcrd.contract    = contract;
            rcrd.action = action;
         });
      }

      /// @abi action
      void remove(account_name account, account_name contract, action_name action) {

         require_auth(account);

         // find items which are for the named poll
         whitelist itr;
         for(auto& item : _records) {
            if (item.account != account && item.contract != contract && item.action != action) {
               itr = item;
               break;
            }
         }

         eosio_assert(itr == 0, "Record does not exist");
         _records.erase(itr);
      }


   private:
      // Setup the struct that represents a row in the table
      /// @abi table
      struct whitelist {
         uint64_t     id;
         account_name account;
         account_name contract;
         action_name  action;

         auto primary_key() const { return id; }
         account_name by_account() const { return account; }
         account_name by_contract() const { return contract; }

      };

      typedef eosio::multi_index<N(whitelist), whitelist> whitelist_table;


      // Creating the instance of the `record_table` type
      whitelist_table _records;
};

EOSIO_ABI( famileos, (create)(remove) )