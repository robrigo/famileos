#include <eosiolib/eosio.hpp>
// #include <eosiolib/print.hpp>
// #include "famileos.cpp"

using namespace eosio;

class whitelisted : public eosio::contract {
 public:
     using contract::contract;

     /// @abi action
     void thing(account_name child) {
     	action(
     		permission_level{ N(famileosiopc), N(active) },
     		N(famileosiopc),
     		N(validate),
     		std::make_tuple(child, _self, N(thing))
     	).send();
     }
};

EOSIO_ABI( whitelisted, (thing) )