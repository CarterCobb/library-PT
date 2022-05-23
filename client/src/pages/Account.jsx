import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import { setUser, logout } from "../redux/types";
import Template from "../components/Template";
import {
  Button,
  Divider,
  Form,
  notification,
  Popconfirm,
  Tabs,
  Input,
} from "antd";
import { BookTwoTone, SettingTwoTone } from "@ant-design/icons";
import "../styles/account.css";
import BookGrid from "../components/BookGrid";
import UserAPI from "../api/user";

const { TabPane } = Tabs;

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      books: null,
      loading: false,
    };
    this.updateAccount = this.updateAccount.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
  }

  componentDidMount() {
    BookAPI.getAllBooks((books, err) => {
      if (err) notification.error({ message: err.error });
      else this.setState({ books });
    });
  }

  updateAccount(values) {
    this.setState({ loading: true });
    UserAPI.updateUser(values, (user, err) => {
      if (err) {
        this.setState({ loading: false });
        notification.error({ message: err.error });
      } else {
        this.setState({ loading: false });
        this.props.dispatch(setUser(user));
      }
    });
  }

  deleteAccount() {
    this.setState({ loading: true });
    UserAPI.deleteUserByUID(this.props.user.uid, (err) => {
      if (err) {
        this.setState({ loading: false });
        notification.error({ message: err.error });
      } else {
        this.setState({ loading: false });
        this.props.dispatch(logout("/"));
      }
    });
  }

  render() {
    const { books, loading } = this.state;
    const { user } = this.props;
    if (!user) return <Navigate to="/not-authorized" replace />;
    if (books === null)
      return (
        <div>
          <h1>Loading Account Info...</h1>
        </div>
      );
    return (
      <Template>
        <h1 className="cc-account-tabs">Account Managment:</h1>
        <Tabs defaultActiveKey="1" className="cc-account-tabs">
          <TabPane
            key="1"
            tab={
              <span className="cc-account-tab-headers">
                <BookTwoTone /> Checked Out Books
              </span>
            }
          >
            <BookGrid
              account
              books={(books || []).filter((book) =>
                (book.states || [])
                  .filter((s) => s.checkedOut)
                  .map((s) => s.user)
                  .includes(user.uid)
              )}
            />
          </TabPane>
          <TabPane
            key="2"
            tab={
              <span className="cc-account-tab-headers">
                <SettingTwoTone /> Settings
              </span>
            }
          >
            <div className="cc-account-settings-container">
              <h2>Update Your Account:</h2>
              <Form
                className="cc-update-form-container"
                name="basic"
                initialValues={{ remember: false }}
                onFinish={this.updateAccount}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    { required: true, message: "Please input your username." },
                  ]}
                  initialValue={user.username}
                >
                  <Input placeholder="ISBN" />
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

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    Update
                  </Button>
                </Form.Item>
              </Form>
              <Divider />
              <h2>Delete Your Account:</h2>
              <p>
                Termainate your account and all of its data. This action cannot
                be undone.
              </p>
              <Popconfirm
                title="Delete this book?"
                onConfirm={this.deleteAccount}
                cancelText="NO!"
                okText="Yes, delete"
              >
                <Button danger loading={loading} disabled={loading}>
                  Terminate Account
                </Button>
              </Popconfirm>
            </div>
          </TabPane>
        </Tabs>
      </Template>
    );
  }
}

export default connect(mapStateToProps)(Account);
