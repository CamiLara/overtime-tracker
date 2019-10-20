import React, { Component } from "react";
// @material-ui/core components
import { withStyles, makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import helper from './settings';
import avatar from "assets/img/faces/marc.jpg";

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};


class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: '',
      workspace: ''
    }
  }
  async componentDidMount() {
    const togglImport = new helper();
    const { apiKey, workspace } = await togglImport.get();
    this.setState({ apiKey, workspace });    
  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  async handleClickSave() {
    this.setState({ loading: true });

    const { apiKey, workspace } = this.state;
    const togglImport = new helper();
    await togglImport.set({ apiKey, workspace });
    const data = await togglImport.get();

    this.setState({
      data: data,
      loading: false
    });
  }

  render() {
    const { classes } = this.props;
    const { apiKey, workspace } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>Edit settings</h4>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="API Key"
                      id="apikey"
                      value={apiKey}
                      formControlProps={{
                        fullWidth: true,
                        onChange: this.handleInputChange.bind(this)
                      }}
                      inputProps={{
                        name: "apiKey",
                        disabled: false,
                        value: apiKey
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Workspace"
                      id="workspace"
                      name="workspace"
                      value={workspace}
                      formControlProps={{
                        name: "workspace",                        
                        fullWidth: true,
                        onChange: this.handleInputChange.bind(this)
                      }}
                      inputProps={{
                        name: "workspace",
                        disabled: false,
                        value: workspace
                      }}
                    />
                  </GridItem>

                </GridContainer>
              </CardBody>
              <CardFooter>
                <Button color="primary" onClick={this.handleClickSave.bind(this)}>Update settings</Button>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withStyles(styles)(UserProfile);
