require 'delegate'

class Commit < SimpleDelegator
  # WIP, this is injection is likely unncessary.
  def initialize(commit, repo)
    @repo = repo
    super(commit)
  end

  def title
    @title ||= message.split(/\n/).first
  end

  def body
    return @body if @body
    data = message.split(/\n/)
    data.shift

    @body = data.join("\n")
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

  # WIP
  # seems the hunk can be .to_s for ease but otherwise can iterate
  # line by ine which is nice, via .lines
  # h.owner is a Patch
  # h.owner.owner is a Diff
  def hunks_to_api
    return @hunks if @hunks

    @hunks = []
     diffs.each do |diff|
      @hunks += diff.each_hunk.map do |hunk|
        {
          status: diff.delta.status,
          path: diff.delta.new_file[:path],
          html: DiffRenderer.render(hunk.lines),
        }
      end
    end

    @hunks
  end

  def payload
    {
      title: title,
      body: body,
      deltas: deltas_to_api,
      hunks: hunks_to_api
    }
  end
end
