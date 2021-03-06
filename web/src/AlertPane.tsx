import React, { PureComponent } from "react"
import TimeAgo from "react-timeago"
import "./AlertPane.scss"
import { combinedAlerts } from "./alerts"
import AnsiLine from "./AnsiLine"
import { ReactComponent as LogoWordmarkSvg } from "./assets/svg/logo-wordmark-gray.svg"
import LogStore from "./LogStore"
import PathBuilder from "./PathBuilder"
import { timeAgoFormatter } from "./timeFormatters"

type Resource = Proto.webviewResource

type AlertsProps = {
  pathBuilder: PathBuilder
  resources: Array<Resource>
  logStore: LogStore | null
}

function logToLines(s: string) {
  return s.split("\n").map((l, i) => <AnsiLine key={"logLine" + i} line={l} />)
}

class AlertPane extends PureComponent<AlertsProps> {
  render() {
    let el = (
      <section className="Pane-empty-message">
        <LogoWordmarkSvg />
        <h2>No Alerts Found</h2>
      </section>
    )

    let alerts = this.renderAlerts()
    if (alerts.length > 0) {
      el = <ul>{alerts}</ul>
    }

    return <section className="AlertPane">{el}</section>
  }

  renderAlerts() {
    let formatter = timeAgoFormatter
    let alertElements: Array<JSX.Element> = []
    let resources = this.props.resources
    let isSnapshot = this.props.pathBuilder.isSnapshot()

    resources.forEach((resource) => {
      let resName = resource.name ?? ""
      let alerts = combinedAlerts(resource, this.props.logStore)
      if (!alerts.length) {
        return
      }

      alerts.forEach((alert) => {
        let dismissButton = <div />
        if (alert.dismissHandler && !isSnapshot) {
          dismissButton = (
            <button
              className="AlertPane-dismissButton"
              onClick={alert.dismissHandler}
            >
              Dismiss
            </button>
          )
        }
        alertElements.push(
          <li key={alert.alertType + resName} className="AlertPane-item">
            <header>
              <div className="AlertPane-headerDiv">
                <h3 className="AlertPane-headerDiv-header">{alert.header}</h3>
              </div>
              <div className="AlertPane-headerDiv">
                <p>
                  <span>Resource: {alert.resourceName}</span>
                  <span>Type: {alert.alertType}</span>
                </p>
                <TimeAgo date={alert.timestamp} formatter={formatter} />
              </div>
            </header>
            <section>{logToLines(alert.msg)}</section>
            {dismissButton}
          </li>
        )
      })
    })
    return alertElements
  }
}

export default AlertPane
