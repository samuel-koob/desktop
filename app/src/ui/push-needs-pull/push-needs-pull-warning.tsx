import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import { DialogFooter, DialogContent, Dialog } from '../dialog'
import { Repository } from '../../models/repository'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { RadioGroup } from '../lib/radio-group'

type PullPolicy = 'merge' | 'rebase'

interface IPushNeedsPullWarningProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  /** Shown for a pull on a diverged branch rather than a rejected push */
  readonly fromPull?: boolean
  /** The repository's pull.rebase config, used as the initial choice */
  readonly pullWithRebase?: boolean
  readonly onDismissed: () => void
}

interface IPushNeedsPullWarningState {
  readonly isLoading: boolean
  readonly pullPolicy: PullPolicy
}

export class PushNeedsPullWarning extends React.Component<
  IPushNeedsPullWarningProps,
  IPushNeedsPullWarningState
> {
  public constructor(props: IPushNeedsPullWarningProps) {
    super(props)

    this.state = {
      isLoading: false,
      pullPolicy: props.pullWithRebase ? 'rebase' : 'merge',
    }
  }

  public render() {
    return (
      <Dialog
        title={
          __DARWIN__ ? 'Newer Commits on Remote' : 'Newer commits on remote'
        }
        dismissDisabled={this.state.isLoading}
        disabled={this.state.isLoading}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onPull}
        loading={this.state.isLoading}
        type="warning"
      >
        <DialogContent>
          {this.props.fromPull ? (
            <p>
              Your branch and the remote have diverged: both have commits the
              other doesn't. Choose how to reconcile them with your local
              commits.
            </p>
          ) : (
            <p>
              GitHub Desktop is unable to push commits to this branch because
              there are commits on the remote that are not present on your local
              branch. Pull these new commits before pushing in order to
              reconcile them with your local commits.
            </p>
          )}
          <p id="pull-policy-heading">Reconcile by:</p>
          <RadioGroup<PullPolicy>
            ariaLabelledBy="pull-policy-heading"
            selectedKey={this.state.pullPolicy}
            radioButtonKeys={['merge', 'rebase']}
            onSelectionChanged={this.onPullPolicyChanged}
            renderRadioButtonLabelContents={this.renderPullPolicyLabel}
          />
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="Pull"
            okButtonDisabled={this.state.isLoading}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private renderPullPolicyLabel = (key: PullPolicy) =>
    key === 'merge'
      ? 'Merge the remote commits into your branch'
      : 'Rebase your local commits onto the remote commits'

  private onPullPolicyChanged = (pullPolicy: PullPolicy) => {
    this.setState({ pullPolicy })
  }

  private onPull = async () => {
    this.setState({ isLoading: true })
    await this.props.dispatcher.pull(
      this.props.repository,
      this.state.pullPolicy === 'rebase'
    )
    this.setState({ isLoading: false })
    this.props.onDismissed()
  }
}
