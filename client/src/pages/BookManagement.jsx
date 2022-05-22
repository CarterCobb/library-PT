import React, { Component, Fragment } from "react";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import Template from "../components/Template";
import {
  List,
  Space,
  Button,
  Popconfirm,
  notification,
  Modal,
  Form,
  Input,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import JsZip from "jszip";
import { saveAs } from "file-saver";
import "../styles/book-management.css";

class BookManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      loading: false,
      openNewModal: false,
      openEditModal: false,
      editBook: {},
    };
    this.download = this.download.bind(this);
    this.createBook = this.createBook.bind(this);
    this.updateBook = this.updateBook.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
  }

  componentDidMount() {
    BookAPI.getAllBooks((books, err) => {
      if (err) notification.error({ message: err.error });
      else this.setState({ books });
    });
  }

  download() {
    var zip = new JsZip();
    zip
      .file("all_book_data.json", JSON.stringify(this.state.books))
      .generateAsync({ compression: "DEFLATE", type: "blob" })
      .then((blob) => saveAs(blob, "all_data.zip"));
  }

  createBook(values) {
    this.setState({ loading: true });
    BookAPI.createBook(values, (new_book, err) => {
      if (err) {
        this.setState({ loading: false });
        notification.error({ message: err.error });
      } else
        this.setState({
          books: [new_book, ...this.state.books],
          loading: false,
          openNewModal: false,
        });
    });
  }

  updateBook(values) {
    this.setState({ loading: true });
    BookAPI.updateBook(values, (updated_book, err) => {
      if (err) {
        this.setState({ loading: false });
        notification.error({ message: err.error });
      } else
        this.setState({
          books: [
            updated_book,
            ...this.state.books.filter((b) => b.isbn !== updated_book.isbn),
          ],
          loading: false,
          openEditModal: false,
        });
    });
  }

  deleteBook(isbn) {
    this.setState({ loading: true });
    BookAPI.deleteBookByISBN(isbn, (err) => {
      if (err) {
        this.setState({ loading: false });
        notification.error({ message: err.error });
      } else {
        BookAPI.getAllBooks((books, err2) => {
          if (err2) {
            this.setState({ loading: false });
            notification.error({ message: err.error });
          } else this.setState({ books, loading: false });
        });
      }
    });
  }

  render() {
    const { books, loading, editBook, openEditModal, openNewModal } =
      this.state;
    const IconButton = ({ icon, onClick, danger }) => (
      <Space>
        <Button
          icon={icon}
          onClick={onClick}
          danger={danger}
          loading={loading}
          disabled={loading}
        />
      </Space>
    );
    return (
      <Fragment>
        <Template>
          <div className="cc-bm-container">
            <h1>Book Management</h1>
            <List
              className="cc-book-table"
              itemLayout="vertical"
              size="large"
              pagination={{
                pageSize: 5,
              }}
              header={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => this.setState({ openNewModal: true })}
                >
                  Create New Book
                </Button>
              }
              footer={
                <Button onClick={this.download}>
                  Download All Book Data For Current Book List
                </Button>
              }
              dataSource={books}
              renderItem={(book) => (
                <List.Item
                  key={book.isbn}
                  actions={[
                    <IconButton
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() =>
                        this.setState({ editBook: book, openEditModal: true })
                      }
                    />,
                    <Popconfirm
                      title="Delete this book?"
                      onConfirm={() => this.deleteBook(book.isbn)}
                      cancelText="NO!"
                      okText="Yes, delete"
                    >
                      <IconButton
                        key="delete"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>,
                  ]}
                  extra={<img src={book.image} width={200} />}
                >
                  <List.Item.Meta
                    title={
                      <a href={`/book/${book.isbn}`} target="_blank">
                        {book.title}
                      </a>
                    }
                    description={book.description}
                  />
                  <h4>
                    Avaliable Inventory: {book.inventory}
                    <br />
                    Total Inventory:{" "}
                    {book.inventory +
                      (book.states || [])
                        .map((s) => s.quantity)
                        .reduce((pv, cv) => pv + cv, 0)}
                  </h4>
                  <List
                    itemLayout="vertical"
                    size="small"
                    pagination={{
                      pageSize: 3,
                    }}
                    header={<h3>Book States:</h3>}
                    dataSource={book.states || []}
                    renderItem={(s) => (
                      <List.Item key={s.updatedAt}>
                        {s.checkedOut && (
                          <p>
                            User: "{s.user}" has <b>checked out</b> {s.quantity}{" "}
                            cop
                            {s.quantity > 1 ? "ies" : "y"} on{" "}
                            {new Date(
                              s.checkoutDate.slice(0, -20)
                            ).toLocaleDateString("en-US")}{" "}
                            at{" "}
                            {new Date(
                              s.checkoutDate.slice(0, -20)
                            ).toLocaleTimeString("en-US")}
                          </p>
                        )}
                        {s.returned && (
                          <p>
                            User: "{s.user}" has <b>returned</b> this book on{" "}
                            {new Date(
                              s.returnDate.slice(0, -20)
                            ).toLocaleDateString("en-US")}{" "}
                            at{" "}
                            {new Date(
                              s.returnDate.slice(0, -20)
                            ).toLocaleTimeString("en-US")}
                          </p>
                        )}
                      </List.Item>
                    )}
                  />
                  <div className="cc-book-list-spacer" />
                </List.Item>
              )}
            />
          </div>
        </Template>
        {/* ---------------------------------- CREATE MODAL ----------------------------------*/}
        <Modal
          title="New Book"
          visible={openNewModal}
          centered
          footer={null}
          onCancel={() => this.setState({ openNewModal: false })}
          destroyOnClose
        >
          <Form
            name="basic"
            initialValues={{ remember: false }}
            onFinish={this.createBook}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="ISBN"
              name="isbn"
              rules={[{ required: true, message: "Please input book ISBN." }]}
            >
              <Input placeholder="ISBN" />
            </Form.Item>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please input book title." }]}
            >
              <Input placeholder="Title" />
            </Form.Item>
            <Form.Item
              label="Author"
              name="author"
              rules={[{ required: true, message: "Please input book author." }]}
            >
              <Input placeholder="Author" />
            </Form.Item>
            <Form.Item
              label="Image"
              name="image"
              rules={[
                {
                  required: true,
                  message: "Please input book cover image url.",
                },
              ]}
            >
              <Input placeholder="Image url" />
            </Form.Item>
            <Form.Item
              label="Desription"
              name="description"
              rules={[
                { required: true, message: "Please input book description." },
              ]}
            >
              <Input.TextArea placeholder="Description" />
            </Form.Item>
            <Form.Item
              label="Inventory"
              name="inventory"
              rules={[
                { required: true, message: "Please input book inventory." },
              ]}
            >
              <InputNumber placeholder="Inventory" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={loading}
                disabled={loading}
              >
                Create
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        {/* ---------------------------------- EDIT MODAL ----------------------------------*/}
        <Modal
          title={`Edit "${editBook.title}"`}
          visible={openEditModal}
          centered
          footer={null}
          onCancel={() => this.setState({ openEditModal: false })}
          destroyOnClose
        >
          <Form
            name="basic"
            initialValues={{ remember: false }}
            onFinish={this.updateBook}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="ISBN"
              name="isbn"
              rules={[{ required: true, message: "Please input book ISBN." }]}
              initialValue={editBook.isbn}
            >
              <Input placeholder="ISBN" />
            </Form.Item>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please input book title." }]}
              initialValue={editBook.title}
            >
              <Input placeholder="Title" />
            </Form.Item>
            <Form.Item
              label="Author"
              name="author"
              rules={[{ required: true, message: "Please input book author." }]}
              initialValue={editBook.author}
            >
              <Input placeholder="Author" />
            </Form.Item>
            <Form.Item
              label="Image"
              name="image"
              rules={[
                {
                  required: true,
                  message: "Please input book cover image url.",
                },
              ]}
              initialValue={editBook.image}
            >
              <Input placeholder="Image url" />
            </Form.Item>
            <Form.Item
              label="Desription"
              name="description"
              rules={[
                { required: true, message: "Please input book description." },
              ]}
              initialValue={editBook.description}
            >
              <Input.TextArea placeholder="Description" />
            </Form.Item>
            <Form.Item
              label="Inventory"
              name="inventory"
              rules={[
                { required: true, message: "Please input book inventory." },
              ]}
              initialValue={editBook.inventory}
            >
              <InputNumber placeholder="Inventory" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                disabled={loading}
              >
                Save
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps)(BookManagement);
