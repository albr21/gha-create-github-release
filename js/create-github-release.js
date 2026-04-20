module.exports = async ({github, context, core, glob, io, exec, getOctokit}) => {
  core.info(`Publishing release note on ${context.repo.owner}/${context.repo.repo}`)

  const data = JSON.parse(core.getInput('inputs', {required: false}))

  let body;
  body = data['body'];
  // Decode base64 encoded body
  body = Buffer.from(body, 'base64').toString('utf-8');

  await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    target_commitish: data['sha'],
    tag_name: data['tag'],
    name: data['name'],
    body: `${body}`,
    draft: false,
    prerelease: false
  });
}
