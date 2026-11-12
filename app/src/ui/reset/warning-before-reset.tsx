import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { Row } from '../lib/row'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Commit } from '../../models/commit'
import { RadioGroup } from '../lib/radio-group'
import { GitResetMode } from '../../lib/git'
import { assertNever } from '../../lib/fatal-error'

const resetModes = [
  GitResetMode.Soft,
  GitResetMode.Mixed,
  GitResetMode.Keep,
  GitResetMode.Merge,
  GitResetMode.Hard,
]

interface IWarningBeforeResetProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly commit: Commit
  readonly hasUncommittedChanges: boolean
  readonly onDismissed: () => void
}

interface IWarningBeforeResetState {
  readonly isLoading: boolean
  readonly mode: GitResetMode
}

/**
 * Dialog that lets the user pick how to reset the current branch to a commit,
 * and warns them if there are uncommitted changes in the working directory.
 */
export class WarningBeforeReset extends React.Component<
  IWarningBeforeResetProps,
  IWarningBeforeResetState
> {
  public constructor(props: IWarningBeforeResetProps) {
    super(props)
    this.state = { isLoading: false, mode: GitResetMode.Mixed }
  }

  public render() {
    const title = __DARWIN__ ? 'Reset to Commit' : 'Reset to commit'
    const { commit, hasUncommittedChanges } = this.props

    return (
      <Dialog
        id="warning-before-reset"
        type="warning"
        title={title}
        loading={this.state.isLoading}
        disabled={this.state.isLoading}
        onSubmit={this.onSubmit}
        onDismissed={this.props.onDismissed}
        role="alertdialog"
        ariaDescribedBy="reset-warning-message"
      >
        <DialogContent>
          <Row id="reset-warning-message">
            Reset the current branch to {commit.shortSha} "{commit.summary}".
            {hasUncommittedChanges &&
              ' You have changes in progress. Depending on the reset mode some of these changes might be lost.'}
          </Row>
          <RadioGroup<GitResetMode>
            ariaLabelledBy="reset-warning-message"
            selectedKey={this.state.mode}
            radioButtonKeys={resetModes}
            onSelectionChanged={this.onModeChanged}
            renderRadioButtonLabelContents={this.renderModeLabel}
          />
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            destructive={
              this.state.mode === GitResetMode.Hard || hasUncommittedChanges
            }
            okButtonText="Reset"
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private renderModeLabel = (mode: GitResetMode) => {
    switch (mode) {
      case GitResetMode.Soft:
        return 'Soft: leave working directory and index untouched'
      case GitResetMode.Mixed:
        return 'Mixed: leave working directory untouched, reset index'
      case GitResetMode.Keep:
        return 'Keep: update working directory to the commit (abort if there are local changes), reset index'
      case GitResetMode.Merge:
        return 'Merge: update working directory to the commit and keep local changes (abort if there are conflicts), reset index'
      case GitResetMode.Hard:
        return 'Hard: reset working directory and index (discard ALL local changes, even uncommitted changes)'
      default:
        return assertNever(mode, `Unknown reset mode: ${mode}`)
    }
  }

  private onModeChanged = (mode: GitResetMode) => {
    this.setState({ mode })
  }

  private onSubmit = async () => {
    const { dispatcher, repository, commit, onDismissed } = this.props
    this.setState({ isLoading: true })

    try {
      await dispatcher.resetToCommit(repository, commit, false, this.state.mode)
    } finally {
      this.setState({ isLoading: false })
    }

    onDismissed()
  }
}
