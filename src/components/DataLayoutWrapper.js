import React, { cloneElement, Component } from "react";
import { connect } from "react-redux";

import { patchViewAttributes } from "../actions/ViewAttributesActions";
import { parseToDisplay } from "../actions/WindowActions";

class DataLayoutWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      layout: [],
      data: [],
      dataId: null
    };
  }

  componentDidMount = () => {
    this.mounted = true;
  };

  componentWillUnmount = () => {
    this.mounted = false;
  };

  handleChange = (field, value) => {
    this.setState(prevState => ({
      data: Object.assign({}, prevState.data, {
        [field]: Object.assign({}, prevState.data[field], {
          value
        })
      })
    }));
  };

  handlePatch = (prop, value, cb) => {
    const { windowType: windowId, viewId } = this.props;
    const { dataId: rowId } = this.state;

    patchViewAttributes(windowId, viewId, rowId, prop, value).then(response => {
      const preparedData = parseToDisplay(response.data[0].fieldsByName);
      preparedData &&
        Object.keys(preparedData).map(key => {
          this.setState(prevState => ({
            data: Object.assign({}, prevState.data, {
              [key]: Object.assign({}, prevState.data[key], preparedData[key])
            })
          }));
        });
    });

    cb && cb();
  };

  setData = (data, dataId, cb) => {
    const preparedData = parseToDisplay(data);
    this.mounted &&
      this.setState(
        {
          data: preparedData,
          dataId: dataId
        },
        () => {
          cb && cb();
        }
      );
  };

  setLayout = (layout, cb) => {
    this.mounted &&
      this.setState(
        {
          layout: layout
        },
        () => {
          cb && cb();
        }
      );
  };

  render() {
    const { layout, data, dataId } = this.state;

    const { children, className } = this.props;

    return (
      <div className={className}>
        {// The nameing of props has a significant prefix
        // to suggest dev that these props are from wrapper
        cloneElement(
          children,
          Object.assign({}, this.props, {
            DLWrapperData: data,
            DLWrapperDataId: dataId,
            DLWrapperLayout: layout,

            DLWrapperSetData: this.setData,
            DLWrapperSetLayout: this.setLayout,
            DLWrapperHandleChange: this.handleChange,
            DLWrapperHandlePatch: this.handlePatch
          })
        )}
      </div>
    );
  }
}

export default connect()(DataLayoutWrapper);
