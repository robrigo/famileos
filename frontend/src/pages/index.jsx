import React, { Component } from 'react';
import Eos from 'eosjs'; // https://github.com/EOSIO/eosjs
import { Keygen } from 'eosjs-keygen'

// material-ui dependencies
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

const parent = {
  name: 'useraaaaaaaa',
  privateKey: '5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5',
  publicKey: 'EOS6kYgMTCh1iqpq9XGNQbEi8Q6k5GujefN9DSs55dcjVyFAq7B6b'
}
const eos = Eos({ keyProvider: parent.privateKey });

// Index component
class Index extends Component {

  constructor(props) {
    super(props)

    this.state = {
      whitelist: []
    }
  }

  componentDidMount() {
    this.getTable()
  }

  // generic function to handle form events (e.g. "submit" / "reset")
  // push transactions to the blockchain by using eosjs
  async createChildAccount(evt) {
    // stop default behaviour
    evt.preventDefault();

    const childName = evt.target.name.value

    const keys = await Keygen.generateMasterKeys()

    const result = await eos.transaction(tr => {
      tr.newaccount({
        creator: parent.name,
        name: childName,
        owner: `${parent.name}@active`,
        active: keys.publicKeys.active
      })

      tr.buyrambytes({
        payer:  parent.name,
        receiver: childName,
        bytes: 8192
      })

      tr.delegatebw({
        from: parent.name,
        receiver: childName,
        stake_net_quantity: '10.0000 SYS',
        stake_cpu_quantity: '10.0000 SYS',
        transfer: 0
      })
    })

    console.log(result);

    this.setState({ child: { name: childName, keys } })
  }

  async addToWhitelist(evt) {
    evt.preventDefault();

    const { child } = this.state
    const { actionName, contractName } = evt.target


    // eosjs function call: connect to the blockchain
    const result = await eos.transaction({
      actions: [{
        account: 'famileosiopc',
        name: 'create',
        authorization: [{
          actor: parent.name,
          permission: 'active',
        }],
        data: {
          parent: parent.name,
          child: child.name,
          contract: contractName.value,
          action: actionName.value
        },
      }],
    });
  }

  async removeFromWhitelist(evt) {
    evt.preventDefault();

    const { child } = this.state
    const { actionName, contractName } = evt.target


    // eosjs function call: connect to the blockchain
    const result = await eos.transaction({
      actions: [{
        account: 'famileosiopc',
        name: 'remove',
        authorization: [{
          actor: parent.name,
          permission: 'active',
        }],
        data: {
          parent: parent.name,
          child: child.name,
          contract: contractName.value,
          action: actionName.value
        },
      }],
    });
  }

  async testAction(evt) {
    evt.preventDefault()
  }

  // gets table data from the blockchain
  // and saves it into the component state: "noteTable"
  getTable() {
    const eos = Eos();
    eos.getTableRows({
      "json": true,
      "code": "famileosiopc",   // contract who owns the table
      "scope": "famileosiopc",  // scope of the table
      "table": "whitelist",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => this.setState({ whitelist: result.rows }));
  }

  render() {
    const { classes } = this.props
    const { child, whitelist } = this.state

    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Famileos
            </Typography>
          </Toolbar>
        </AppBar>

        <Typography variant="headline" component="h2">
          Welcome {parent.name}!
        </Typography>

        <div className={classes.row}>
          <Paper className={classes.paper}>
            <form onSubmit={this.createChildAccount.bind(this)}>
              <Typography variant="headline" component="h2">
                Create Child Account
              </Typography>
              <TextField
                name="name"
                autoComplete="off"
                label="Child Account Name"
                margin="normal"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.formButton}
                type="submit">
                Create Child Account
              </Button>
            </form>
          </Paper>

          <Paper className={classes.paper}>
            <form onSubmit={this.addToWhitelist.bind(this)}>
              <Typography variant="headline" component="h2">
                Add Action To Whitelist
              </Typography>
              <TextField
                name="contractName"
                autoComplete="off"
                label="Account Name of Contract"
                margin="normal"
                fullWidth
              />
              <TextField
                name="actionName"
                autoComplete="off"
                label="Name of Action"
                margin="normal"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.formButton}
                type="submit">
                Add Action to Whitelist
              </Button>
            </form>
          </Paper>
        </div>

        <div className={classes.row}>
          <Paper className={classes.paper}>
            <form onSubmit={this.removeFromWhitelist.bind(this)}>
              <Typography variant="headline" component="h2">
                Remove Action From Whitelist
              </Typography>
              <TextField
                name="contractName"
                autoComplete="off"
                label="Account Name of Contract"
                margin="normal"
                fullWidth
              />
              <TextField
                name="actionName"
                autoComplete="off"
                label="Name of Action"
                margin="normal"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.formButton}
                type="submit">
                Remove Action from Whitelist
              </Button>
            </form>
          </Paper>

          <Paper className={classes.paper}>
            <form onSubmit={this.testAction.bind(this)}>
              <Typography variant="headline" component="h2">
                Call an Action
              </Typography>
              <TextField
                name="contractName"
                autoComplete="off"
                label="Account Name of Contract"
                margin="normal"
                fullWidth
              />
              <TextField
                name="actionName"
                autoComplete="off"
                label="Name of Action"
                margin="normal"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.formButton}
                type="submit">
                Call Action
              </Button>
            </form>
          </Paper>
        </div>

        {whitelist.map((record) => (
          <div>{JSON.stringify(record)}</div>
        ))}
      </div>
    );
  }

}

// set up styling classes using material-ui "withStyles"
const styles = theme => ({
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    margin: 10,
    width: 500
  },
  formButton: {
    marginTop: theme.spacing.unit,
  },
  row: {
    display: 'flex',
    justifyContent: 'center'
  }
});

export default withStyles(styles)(Index);
