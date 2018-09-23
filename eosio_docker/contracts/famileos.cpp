#include <eosiolib/eosio.hpp>

class famileos : public eosio::contract {
   public:
      famileos( account_name s ):
         contract( s ),   // initialization of the base class for the contract
         _records( s, s ) // initialize the table with code and scope NB! Look up definition of code and scope   
      {
      }

      /// @abi action
      void create(account_name parent, account_name child, account_name contract, action_name action) {

         require_auth(parent);

          for(auto& item : _records) {
            eosio_assert(!(item.child == child && item.contract == contract && item.action == action), "Whitelist entry already exists.");
          }

         _records.emplace(parent, [&]( auto& rcrd ) {
            rcrd.id = _records.available_primary_key();
            rcrd.child    = child;
            rcrd.contract    = contract;
            rcrd.action = action;
         });
      }

      /// @abi action
      void remove(account_name parent, account_name child, account_name contract, action_name action) {

         require_auth(parent);

         whitelist record;
         int found = -1;
         for(auto& item : _records) {
            if (item.child == child && item.contract == contract && item.action == action) {
               record = item;
               found = 1;
               break;
            }
         }

         eosio_assert(found == 1, "Whitelist entry does not exist.");
         _records.erase(_records.find(record.id));
      }

      /// @abi action
      void validate(account_name child, account_name contract, action_name action) {

         whitelist itr;
         int allowed = 1;
         for(auto& item : _records) {
            if (item.child == child) {
               if (item.contract == contract && item.action == action) {
                  allowed = 1;
                  break;
               } else {
                  allowed = 0;
               }
            }
            
         }

         eosio_assert(allowed == 1, "Action is not whitelisted.");
      }


   private:
      // Setup the struct that represents a row in the table
      /// @abi table
      struct whitelist {
         uint64_t     id;
         account_name child;
         account_name contract;
         action_name  action;

         auto primary_key() const { return id; }
         account_name by_child() const { return child; }
         account_name by_contract() const { return contract; }

      };

      typedef eosio::multi_index<N(whitelist), whitelist, eosio::indexed_by<N(child), eosio::const_mem_fun<whitelist, uint64_t, &whitelist::by_child>>, eosio::indexed_by<N(contract), eosio::const_mem_fun<whitelist, uint64_t, &whitelist::by_contract>>> whitelist_table;


      // Creating the instance of the `record_table` type
      whitelist_table _records;
};

EOSIO_ABI( famileos, (create)(remove)(validate) )