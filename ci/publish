#!/bin/bash -e

if [ -z "$GIT_KEY" ] || [ -z "$NPM_TOKEN" ]; then
  echo Skipping publish in Pull Request
  exit 0
fi

GITHUB_FINGERPRINT=16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48

echo Addding github.com to known_hosts
mkdir -p /root/.ssh
touch /root/.ssh/known_hosts
ssh-keyscan -H github.com >> /root/.ssh/known_hosts
chmod 600 /root/.ssh/known_hosts

echo Validating good known_hosts
ssh-keygen -l -f ~/.ssh/known_hosts | grep $GITHUB_FINGERPRINT

echo Starting ssh-agent
eval "$(ssh-agent -s)"

echo Loading github key
echo $GIT_KEY | sed -E 's/([^ ]{64}) /*\1*/g' | tr "*" "\n" | sed '/^$/d' > /tmp/git_key
chmod 600 /tmp/git_key
ssh-add /tmp/git_key
rm /tmp/git_key

echo Setting up secrets
GIT_PATH=`git remote -v | grep push | sed 's/ (push)//' | cut -d'/' -f4-5`
git remote set-url --push origin git@github.com:$GIT_PATH
npm config set access public > /dev/null 2>&1
npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN > /dev/null 2>&1

echo Bump the version
./node_modules/.bin/npm-auto-version

echo Publish the package
npm publish

echo Push the new tag to GitHub
git push origin --tags -q
