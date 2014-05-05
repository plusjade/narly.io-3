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

  def steps
    @steps ||= readme.steps
  end

  def step(index)
    Step.new(index, self)
  end

  def commit_at(index)
    return nil unless commits_indices.has_value?(index)
    Commit.new(lookup(commits_indices.key(index)), self)
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
