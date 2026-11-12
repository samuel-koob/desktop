import { readdir } from 'fs/promises'
import { join } from 'path'
import { pathExists } from './path-exists'

/**
 * Returns the paths of the direct subdirectories of `directory` that contain a
 * `.git` entry (a directory, or a file for worktrees and submodules).
 */
export async function findChildRepositories(
  directory: string
): Promise<ReadonlyArray<string>> {
  const entries = await readdir(directory, { withFileTypes: true })
  const dirs = entries
    .filter(e => e.isDirectory())
    .map(e => join(directory, e.name))
  const isRepo = await Promise.all(dirs.map(d => pathExists(join(d, '.git'))))
  return dirs.filter((_, i) => isRepo[i])
}
