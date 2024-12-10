import PostPage from 'components/PostPage'
import PreviewPostPage from 'components/PreviewPostPage'
import { readToken } from 'lib/sanity.api'
import {
  getAllPostsSlugs,
  getClient,
  getPostAndMoreStories,
  getSettings,
} from 'lib/sanity.client'
import { Post, Settings } from 'lib/sanity.queries'
import { GetServerSideProps } from 'next'
import type { SharedPageProps } from 'pages/_app'

interface PageProps extends SharedPageProps {
  post: Post
  morePosts: Post[]
  settings?: Settings
}

interface Query {
  [key: string]: string
}

export default function ProjectSlugRoute(props: PageProps) {
  const { settings, post, morePosts, draftMode } = props

  if (draftMode) {
    return (
      <PreviewPostPage post={post} morePosts={morePosts} settings={settings} />
    )
  }

  return <PostPage post={post} morePosts={morePosts} settings={settings} />
}

export const getServerSideProps: GetServerSideProps<PageProps, Query> = async (ctx) => {
  const { draftMode = false, params = {} } = ctx
  const client = getClient(draftMode ? { token: readToken } : undefined)

  const [settings, { post, morePosts }] = await Promise.all([
    getSettings(client),
    getPostAndMoreStories(client, params.slug),
  ])

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
      morePosts,
      settings,
      draftMode,
      token: draftMode ? readToken : '',
    },
  }
}