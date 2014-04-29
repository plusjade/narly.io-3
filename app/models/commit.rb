require 'delegate'

class Commit < SimpleDelegator
  attr_reader :index

  # WIP, this is injection is likely unncessary.
  def initialize(commit, index, repo)
    @index = index.to_i
    @repo = repo
    super(commit)
  end

  def first_commit?
    @repo.first_commit.oid == oid
  end

  def title
    @title ||= message.split(/\n/).first
  end

  def body
    return @body if @body
    data = message.split(/\n/)
    data.shift

    @body = OutputRenderer.markdown(data.join("\n"))
  end

  def diffs
    @diffs ||= @repo.diffs_from_last(__getobj__)
  end

  def deltas_to_api
    @deltas ||= diffs.deltas.each.map do |d|
      {
        status: d.status,
        path: d.new_file[:path]
      }
    end
  end

  def deltas_to_hash
    return @deltas_to_hash if @deltas_to_hash

    @deltas_to_hash = {}
    diffs.deltas.each do |d|
      @deltas_to_hash[d.new_file[:path]] = {
        status: d.status,
        path: d.new_file[:path]
      }
    end

    @deltas_to_hash
  end

  # WIP
  # seems the hunk can be .to_s for ease but otherwise can iterate
  # line by ine which is nice, via .lines
  # h.owner is a Patch
  # h.owner.owner is a Diff
  def diffs_to_api
    return @diffs_to_api if @diffs_to_api
    @diffs_to_api = []

    diffs.each do |diff|
      path = diff.delta.new_file[:path]
      # Presumably only the first commit
      next if path.split('.').first.to_s.downcase == "readme"

      lines = []
      diff.each_hunk.each do |hunk|
        lines += hunk.lines
      end

      html = OutputRenderer.diff(lines)
      status = diff.delta.status

      @diffs_to_api << {
        status: status,
        path: path,
        html: html,
      }
    end

    @diffs_to_api
  end

  # The directory snapshot at the time of this commit.
  def snapshot
    ls_tree(tree).map do |path|
      { 
        path: path,
        status: deltas_to_hash[path] ? 
                  deltas_to_hash[path][:status] :
                  :context
      }
    end
  end

  def readme
    @repo.readme.chunk(@index)
  end

  def payload
    {
      title: title,
      body: body,
      index: @index,
      diffs: diffs_to_api,
      snapshot: snapshot,
    }.merge(readme)
  end

  # git ls-tree --name-only -r sha
  def ls_tree(_tree, namespace=nil)
    files = []

    _tree.each do |a|
      name = namespace ? [namespace, a[:name]].join('/') : a[:name]

      if a[:type] == :blob
        files << name
      elsif a[:type] == :tree
        files += ls_tree(@repo.lookup(a[:oid]), name)
      end
    end

    files
  end
end
