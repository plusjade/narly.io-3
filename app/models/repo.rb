require 'delegate'

class Repo < SimpleDelegator
  attr_reader :name

  def initialize(name)
    raise "Repo name not defined" unless name
    @name = name
    path = Sandbox.get_repo_path(name)
    super(Rugged::Repository.new(path))
  end

  def readme
    return @readme if @readme
    content = ''
    FileUtils.cd(workdir) do
      path = Dir['*'].find{ |a| a =~ /^readme\./i }
      content = File.open(path, 'r:UTF-8') { |f| f.read }
    end

    @readme = Readme.new(content)
  end

  def step(index)
    sha = commits_indices.key(index.to_i)
    raise "No commit found at index #{ index }" unless sha
    commit(sha)
  end

  def commit(sha)
    Commit.new(lookup(sha), commits_indices[sha], self)
  end

  def commits
    @commits ||= _commits.each_with_index.map do |commit, i|
                    {
                      sha: commit.oid,
                      title: readme.headers_human[i],
                      slug: OutputRenderer.clean_slug_and_escape(readme.headers_human[i]),
                      index: i
                    }
                  end
  end

  def commits_indices
    return @commits_indices if @commits_indices
    @commits_indices = {}
    _commits.each_with_index do |commit, i|
      @commits_indices[commit.oid] = i
    end

    @commits_indices
  end

  def _commits
    walk(last_commit.oid, Rugged::SORT_REVERSE)
  end

  def diffs_from_last(sha_or_commit)
    commit = sha_or_commit.is_a?(String) ? lookup(sha_or_commit) : sha_or_commit

    source = commit.parents.present? ? commit.parents.first : nil
    diff(source, commit)
  end
end
