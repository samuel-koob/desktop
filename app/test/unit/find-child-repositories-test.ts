import assert from 'node:assert'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { findChildRepositories } from '../../src/lib/find-child-repositories'
import { createTempDirectory } from '../helpers/temp'

describe('findChildRepositories', () => {
  it('returns only direct subdirectories that contain .git', async t => {
    const root = await createTempDirectory(t)
    await mkdir(join(root, 'repo-a', '.git'), { recursive: true })
    await mkdir(join(root, 'worktree'))
    await writeFile(join(root, 'worktree', '.git'), 'gitdir: elsewhere')
    await mkdir(join(root, 'not-a-repo'))
    await mkdir(join(root, 'nested', 'deep-repo', '.git'), { recursive: true })
    await writeFile(join(root, 'file.txt'), '')

    const result = await findChildRepositories(root)

    assert.deepStrictEqual(
      [...result].sort(),
      [join(root, 'repo-a'), join(root, 'worktree')].sort()
    )
  })
})
