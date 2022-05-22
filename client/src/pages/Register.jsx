import React, { Component } from "react";
import Template from "../components/Template";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import { setUser } from "../redux/types";
import { Form, Input, Button, Radio, notification } from "antd";
import UserAPI from "../api/user";
import { ls } from "../App";
import "../styles/register.css";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.register = this.register.bind(this);
  }

  register(values) {
    this.setState({ loading: true });
    UserAPI.createUser(values, (user, err) => {
      if (err) {
        this.setState({ loading: false });
        notification.error({ message: err.error });
      } else
        UserAPI.login(values, (data, err) => {
          if (err) {
            notification.error({ message: err.error });
            this.setState({ loading: false });
          } else {
            ls.set("74", data.token);
            this.setState({ loading: false });
            this.props.dispatch(setUser(data.user));
            window.location.href = "/";
          }
        });
    });
  }

  render() {
    const { loading } = this.state;
    const options = [
      { label: "User", value: "USER" },
      { label: "Librarian", value: "LIBRARIAN" },
    ];
    return (
      <Template>
        <div className="cc-register-container">
          <Form
            className="cc-form-container"
            name="basic"
            initialValues={{ remember: false }}
            onFinish={this.register}
            autoComplete="off"
            layout="vertical"
          >
            <h1>Register</h1>
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username." },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password." },
              ]}
            >
              <Input.Password placeholder="Pasword" />
            </Form.Item>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Radio.Group
                options={options}
                onChange={this.onChange3}
                value={"USER"}
                optionType="button"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Template>
    );
  }
}

export default connect(mapStateToProps)(Register);
