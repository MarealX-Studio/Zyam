import { GithubRepoInfo, UserInfo, SyncStateEnum } from '@/lib/github.types'
import { GiteeRepoInfo } from '@/lib/gitee'
import { GitlabUserInfo, GitlabProjectInfo } from '@/lib/gitlab.types'
import { create } from 'zustand'

interface SyncState {
  userInfo?: UserInfo
  setUserInfo: (userInfo?: UserInfo) => void

  syncRepoState: SyncStateEnum
  setSyncRepoState: (syncRepoState: SyncStateEnum) => void
  syncRepoInfo?: GithubRepoInfo
  setSyncRepoInfo: (syncRepoInfo?: GithubRepoInfo) => void

  giteeUserInfo?: any
  setGiteeUserInfo: (giteeUserInfo?: any) => void

  giteeSyncRepoState: SyncStateEnum
  setGiteeSyncRepoState: (giteeSyncRepoState: SyncStateEnum) => void
  giteeSyncRepoInfo?: GiteeRepoInfo
  setGiteeSyncRepoInfo: (giteeSyncRepoInfo?: GiteeRepoInfo) => void

  gitlabUserInfo?: GitlabUserInfo
  setGitlabUserInfo: (gitlabUserInfo?: GitlabUserInfo) => void

  gitlabSyncProjectState: SyncStateEnum
  setGitlabSyncProjectState: (gitlabSyncProjectState: SyncStateEnum) => void
  gitlabSyncProjectInfo?: GitlabProjectInfo
  setGitlabSyncProjectInfo: (gitlabSyncProjectInfo?: GitlabProjectInfo) => void
}

const useSyncStore = create<SyncState>((set) => ({
  userInfo: undefined,
  setUserInfo: (userInfo) => {
    set({ userInfo })
  },

  syncRepoState: SyncStateEnum.fail,
  setSyncRepoState: (syncRepoState) => {
    set({ syncRepoState })
  },
  syncRepoInfo: undefined,
  setSyncRepoInfo: (syncRepoInfo) => {
    set({ syncRepoInfo })
  },

  giteeUserInfo: undefined,
  setGiteeUserInfo: (giteeUserInfo) => {
    set({ giteeUserInfo })
  },

  giteeSyncRepoState: SyncStateEnum.fail,
  setGiteeSyncRepoState: (giteeSyncRepoState) => {
    set({ giteeSyncRepoState })
  },
  giteeSyncRepoInfo: undefined,
  setGiteeSyncRepoInfo: (giteeSyncRepoInfo) => {
    set({ giteeSyncRepoInfo })
  },

  gitlabUserInfo: undefined,
  setGitlabUserInfo: (gitlabUserInfo) => {
    set({ gitlabUserInfo })
  },

  gitlabSyncProjectState: SyncStateEnum.fail,
  setGitlabSyncProjectState: (gitlabSyncProjectState) => {
    set({ gitlabSyncProjectState })
  },
  gitlabSyncProjectInfo: undefined,
  setGitlabSyncProjectInfo: (gitlabSyncProjectInfo) => {
    set({ gitlabSyncProjectInfo })
  },
}))

export default useSyncStore