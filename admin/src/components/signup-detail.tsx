import {
  Badge,
  Button,
  Card,
  Divider,
  Icon,
  Modal,
  Popconfirm,
  Timeline,
  Tree,
} from "antd"
import { History } from "history"
import * as moment from "moment"
import * as React from "react"

import { API } from "./../helpers/api"
import { SignupModel } from "./../helpers/signup-model"
import "./signup-detail.css"

const formatDate = (date: string) => moment(date).format("YYYY-MM-DD HH:mm")

interface SignupDetailProps {
  api: API
  history: History
  match: {
    id: string,
  }
}

enum CardAction {
  Approve,
  Reject,
}

interface SignupDetailState {
  actions?: any[]
  loading: boolean
  cardAction?: CardAction
  location?: any
  signup?: SignupModel
}

function ActionTimeline({ actions }: { actions: any[] }) {
  const items = actions.map((action, idx) => {
    switch (action.action) {
      case "check_username":
        return (
          <Timeline.Item key={idx} color="#A0D911">
            Check username {action.metadata.username}
            <br />
            <small>{formatDate(action.created_at)}</small>
          </Timeline.Item>
        )
      case "request_email":
        return (
          <Timeline.Item
            key={idx}
            dot={
              <Icon
                type="mail"
                style={{ fontSize: "16px", color: "#1890FF" }}
              />
            }
          >
            Send email verification to {action.metadata.email}
            <br />
            <small>{formatDate(action.created_at)}</small>
          </Timeline.Item>
        )
      case "try_number":
        return (
          <Timeline.Item
            key={idx}
            dot={
              <Icon
                type="phone"
                style={{ fontSize: "16px", color: "#1890FF" }}
              />
            }
          >
            Try number {action.metadata.phoneNumber}
            <br />
            <small>{formatDate(action.created_at)}</small>
          </Timeline.Item>
        )
      case "send_sms":
        return (
          <Timeline.Item
            key={idx}
            dot={
              <Icon
                type="phone"
                style={{ fontSize: "16px", color: "#FA541C" }}
              />
            }
          >
            Send phone verification to {action.metadata.phoneNumber}
            <br />
            <small>{formatDate(action.created_at)}</small>
          </Timeline.Item>
        )
      default:
        return (
          <Timeline.Item key={idx} color="grey">
            {action.action}
            <br />
            <small>{formatDate(action.created_at)}</small>
          </Timeline.Item>
        )
    }
  })
  return <Timeline>{items}</Timeline>
}

interface Fingerprint {
  [key: string]: string | Fingerprint
}

function FingerprintTree({ fingerprint }: { fingerprint: Fingerprint }) {
  const render = (data: any, parent?: string) => {
    const nodes: JSX.Element[] = []
    for (const key of Object.keys(data)) {
      const value = data[key]
      const nodeKey = `${parent || "root"}-${key}`
      if (typeof value === "string") {
        nodes.push(
          <Tree.TreeNode key={nodeKey} title={key}>
            <Tree.TreeNode key={`${nodeKey}-value`} title={value} />
          </Tree.TreeNode>,
        )
      } else {
        nodes.push(
          <Tree.TreeNode key={nodeKey} title={key}>
            {render(value, nodeKey)}
          </Tree.TreeNode>,
        )
      }
    }
    return nodes
  }
  return <Tree defaultExpandAll={true}>{render(fingerprint)}</Tree>
}

class SignupDetail extends React.Component<
  SignupDetailProps,
  SignupDetailState
> {
  constructor(props: SignupDetailProps, context?: any) {
    super(props, context)
    this.state = {
      loading: false,
    }
  }

  public componentWillMount() {
    this.loadData()
  }

  public loadData() {
    this.setState({ loading: true })
    const where = {
      id: parseInt(this.props.match.id, 10),
    }
    this.props.api
      .call("/get_signup", { where })
      .then((result) => {
        this.setState({
          actions: result.actions,
          loading: false,
          location: result.location,
          signup: result.user,
        })
      })
      .catch((error) => {
        Modal.error({
          content: error.message || String(error),
          title: "Unable to load signup",
        })
      })
  }

  public onApprove = () => {
    const { signup } = this.state
    if (!signup) {
      return
    }
    this.setState({ cardAction: CardAction.Approve })
    this.props.api
      .call("/approve_signups", { ids: [signup.id] })
      .then((result) => {
        if (result[0].error) {
          throw new Error(result[0].error)
        } else {
          signup.status = "approved"
          this.setState({ signup, cardAction: undefined })
        }
      })
      .catch((error) => {
        Modal.error({
          content: error.message || String(error),
          title: "Unable to approve",
        })
        this.setState({ cardAction: undefined })
      })
  }

  public onReject = () => {
    const { signup } = this.state
    if (!signup) {
      return
    }
    this.setState({ cardAction: CardAction.Reject })
    this.props.api
      .call("/reject_signups", { ids: [signup.id] })
      .then((result) => {
        if (result[0].error) {
          throw new Error(result[0].error)
        } else {
          signup.status = "rejected"
          this.setState({ signup, cardAction: undefined })
        }
      })
      .catch((error) => {
        Modal.error({
          content: error.message || String(error),
          title: "Unable to reject",
        })
        this.setState({ cardAction: undefined })
      })
  }

  public render() {
    const { actions, loading, signup, location, cardAction } = this.state
    const title = `Signup ${this.props.match.id}`
    let details = null
    const actionsEnabled = signup && !cardAction
    const cardActions = [
      {
        call: this.onApprove,
        loading: cardAction === CardAction.Approve,
        name: "Approve",
      },
      {
        call: this.onReject,
        loading: cardAction === CardAction.Reject,
        name: "Reject",
      },
    ]

    const actionElements: JSX.Element[] = []
    const needsConfirm = signup && signup.status !== "manual_review"
    for (const action of cardActions) {
      const button = (
        <Button
          key={`action-button-${action.name}`}
          loading={action.loading}
          disabled={!actionsEnabled}
          onClick={needsConfirm ? undefined : action.call}
          type={needsConfirm ? "dashed" : undefined}
          size="small"
        >
          {action.name}
        </Button>
      )
      if (needsConfirm) {
        actionElements.push(
          <Popconfirm
            key={`action-confirm-${action.name}`}
            okText="Do it!"
            title="Are you sure you want to change the status of a signup that is not in manual review?"
            onConfirm={action.call}
          >
            {button}
          </Popconfirm>,
        )
      } else {
        actionElements.push(button)
      }
      actionElements.push(<Divider type="vertical" />)
    }
    actionElements.pop() // drop the last divider
    const verifiedLabel = (verified: boolean) => (
      <Badge
        status={verified ? "success" : "default"}
        text={verified ? "verified" : "not verified"}
      />
    )
    if (signup && actions) {
      details = (
        <div className="details">
          <p>
            <span className="label">Status</span>
            <span className="value">
              {signup.status === "0" ? "unverified" : signup.status}
            </span>
            {signup.status === "created" ? (
              <small>
                <a
                  target="_blank"
                  href={`https://alpha.ezira.io/@${signup.username}`}
                >
                  go to your profile
                </a>
              </small>
            ) : null}
          </p>
          <p>
            <span className="label">Email</span>
            <span className="value">{signup.email || "N/A"}</span>
            {verifiedLabel(signup.email_is_verified)}
          </p>
          <p>
            <span className="label">Phone</span>
            <span className="value">{signup.phone_number || "N/A"}</span>
            {verifiedLabel(signup.phone_number_is_verified)}
          </p>
          <p>
            <span className="label">Username</span>
            <span className="value">{signup.username}</span>
          </p>
          <p>
            <span className="label">IP address</span>
            <span className="value">{signup.ip}</span>
            <small>
              {location && location.country ? location.country.names.en : ""}
            </small>
          </p>
          <p>
            <span className="label">Gatekeeper note</span>
            <span className="value">{signup.review_note || "n/a"}</span>
          </p>
          <p>
            <span className="label">Created</span>
            <span className="value">{formatDate(signup.created_at)}</span>
          </p>
          <p>
            <span className="label">Last update</span>
            <span className="value">{formatDate(signup.updated_at)}</span>
          </p>
          <Divider>Fingerprint</Divider>
          <FingerprintTree fingerprint={signup.fingerprint} />
          <Divider>Actions</Divider>
          <ActionTimeline actions={actions} />
        </div>
      )
    }
    return (
      <div className="signup-detail">
        <Card loading={loading} title={title} extra={actionElements}>
          {details}
        </Card>
      </div>
    )
  }
}

export default SignupDetail
