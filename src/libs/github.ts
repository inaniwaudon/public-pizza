import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

const octkit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  timeZone: "Asia/Tokyo",
});

export const getIssueComments = async (
  owner: string,
  repo: string,
  issueNo: number,
) =>
  await octkit.issues.listComments({
    owner,
    repo,
    issue_number: issueNo,
  });

export const closeIssue = async (
  owner: string,
  repo: string,
  issueNo: number,
) =>
  await octkit.issues.update({
    owner,
    repo,
    issue_number: issueNo,
    state: "closed",
  });

export const getComment = (
  text: string,
  action: boolean,
  comments: RestEndpointMethodTypes["issues"]["listComments"]["response"],
) => {
  const githubActions = "github-actions[bot]";
  const comment = comments.data.find(
    (comment) =>
      comment.body?.includes(text) &&
      (action
        ? comment.user?.login === githubActions
        : comment.user?.login !== githubActions),
  );
  return comment?.body ?? null;
};
