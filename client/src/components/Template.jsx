import React, { Component, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import { setUser, logout } from "../redux/types";
import UserAPI from "../api/user";
import { ls } from "../App";
import Logo from "../images/logo.png";
import { Modal, Button, Form, Input, notification } from "antd";
import "../styles/template.css";
import Search from "./Search";

const withNavigate = (Component) => {
  return (props) => <Component {...props} navigate={useNavigate()} />;
};

class Template extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openLogin: false,
      loading: false,
    };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  login(creds) {
    this.setState({ loading: true });
    UserAPI.login(creds, (data, err) => {
      if (err) {
        notification.error({ message: err.error });
        this.setState({ loading: false });
      } else {
        ls.set("74", data.token);
        this.setState({ openLogin: false, loading: false });
        this.props.dispatch(setUser(data.user));
      }
    });
  }

  logout() {
    notification.success({ message: "Logged out" });
    this.props.dispatch(
      logout(window.location.pathname === "/book-management")
    );
  }

  render() {
    const { navigate, user, children } = this.props;
    const { openLogin, loading } = this.state;
    return (
      <Fragment>
        <div className="cc-template-header">
          <img src={Logo} className="logo" />
          <div className="cc-template-header-spacer" />
          {window.location.pathname !== "/" ? (
            <Fragment>
              <div className="search" />
              <Button type="link" onClick={() => navigate("/")}>
                Home
              </Button>
            </Fragment>
          ) : (
            <div className="search">
              <Search onSubmit={this.props.onSearch} />
            </div>
          )}
          {user &&
            user.role === "LIBRARIAN" &&
            window.location.pathname !== "/book-management" && (
              <Button type="link" onClick={() => navigate("/book-management")}>
                Book Management
              </Button>
            )}
          {user ? (
            <Button type="primary" onClick={this.logout}>
              Log out
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => this.setState({ openLogin: true })}
            >
              Login
            </Button>
          )}
        </div>
        {children}
        <div className="cc-template-footer">
          <p>
            This website is a project satisfying a code challenge from
            Psychology Today.
          </p>
          <p>
            To view the source code and/or edit the code yourself vist{" "}
            <a href="https://github.com/CarterCobb/library-PT">
              GitHub: CarterCobb/library-PT
            </a>
            .
          </p>
          <p>
            Built by <a href="https://linktr.ee/cjcobb">Carter Cobb</a>. &copy;
            2022.
          </p>
        </div>

        <Modal
          title="Login"
          centered
          visible={openLogin}
          onCancel={() => this.setState({ openLogin: false })}
          footer={null}
          width={300}
        >
          <Form
            name="normal_login"
            initialValues={{ remember: true }}
            onFinish={this.login}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps)(withNavigate(Template));
